# Robot Control and Markov Decision Processes

A quadruped, a five-fingered hand solving a Rubik's cube, and a quadcopter have almost nothing in common as machines. They have different numbers of limbs, different actuators, different physics. Yet all three do the same job: they turn a high-level goal into motor commands for one particular body. If we want a single model that can eventually drive all of them, we need one language that describes all of them. This chapter builds that language in two halves. The first half is classical robot control — the geometry and the low-level machinery that turn a desired motion into joint commands, which every learned policy still sits on top of. The second half is the Markov decision process, the formalism that turns "decide what to do" into a mathematical problem, and which every algorithm in the rest of the book is a way of solving.

The two halves answer different questions, and the split matters. Control asks: given that I want the hand *there*, how do I move the joints? That question is largely solved, by mathematics that predates machine learning by decades. Decision-making asks: where should the hand go, given a goal, a camera image, and a world that will not hold still? That question is not solved, and it is what the rest of the book is about.

## Rigid bodies and the frames that describe them

Start with the simplest useful lie: assume every part of the robot is a **rigid body**. A rigid body is one where the distance between any two points on it never changes — it does not squish or stretch. The lie is useful because of what it buys. If a body is rigid, you do not need to track where all of its infinitely many points are. You attach one coordinate frame to it, and the position and orientation of that single frame tells you where every point on the body is.

How many numbers does that frame need? For a body confined to a plane — a mobile base rolling across a floor — three: two for position, one for heading. The set of all such positions-and-orientations is called the **special Euclidean group in two dimensions**, written $SE(2)$. For a body free to move in space — a drone, a gripper — six: three for position, three for orientation (roll, pitch, yaw). That set is $SE(3)$.

The convenient way to write an element of either group is a **homogeneous transformation matrix**, which packs rotation and translation into one square matrix so that composing two motions becomes matrix multiplication:

$$\mathbf{T}_{SE(2)} = \begin{bmatrix} \cos\theta & -\sin\theta & x \\ \sin\theta & \cos\theta & y \\ 0 & 0 & 1 \end{bmatrix}, \qquad \mathbf{T}_{SE(3)} = \begin{bmatrix} r_{11} & r_{12} & r_{13} & x \\ r_{21} & r_{22} & r_{23} & y \\ r_{31} & r_{32} & r_{33} & z \\ 0 & 0 & 0 & 1 \end{bmatrix}$$ {#eq:transforms}

**In words.** A single matrix describes both where a body is and how it is turned, in a form you can multiply.

**The symbols.** In the planar case, $x$ and $y$ are the position of the body's frame and $\theta$ is its heading angle, so the upper-left $2\times2$ block is a planar rotation. In the spatial case, $x, y, z$ are the position and the upper-left $3\times3$ block of entries $r_{ij}$ is a rotation matrix. The bottom row is always $[0\ \cdots\ 0\ 1]$; it carries no information about the body and exists only to make the matrices composable.

**Why this shape.** The padding row is the whole trick. A rotation alone can be applied by multiplying a vector by a $3\times3$ matrix, but a translation is an addition, and you cannot compose a mixture of multiplications and additions by matrix multiplication alone. Adding one dimension, with a 1 in the corner, turns "rotate then translate" into a single matrix product. Without it, chaining a dozen frames along an arm would be a bookkeeping exercise in alternating operations rather than a product of a dozen matrices.

Not every $3\times3$ block is a legal rotation. The legal ones form the **special orthogonal group**:

$$SO(n) = \{\, \mathbf{R} \in \mathbb{R}^{n\times n} \;\mid\; \mathbf{R}^\top \mathbf{R} = \mathbf{I},\ \det(\mathbf{R}) = 1 \,\}$$ {#eq:son}

**In words.** A matrix is a rotation exactly when it preserves lengths and angles and does not turn the body inside out.

**The symbols.** $\mathbf{R}$ is a candidate rotation matrix, $\mathbf{I}$ the identity, $\mathbf{R}^\top$ the transpose, and $\det$ the determinant. $n$ is 2 for planar motion and 3 for spatial motion.

**Why this shape.** Both conditions earn their place. The first, $\mathbf{R}^\top\mathbf{R} = \mathbf{I}$, says the transpose is the inverse, which is the algebraic statement that the columns are mutually perpendicular unit vectors — so applying $\mathbf{R}$ cannot stretch or shear the body. Drop it and the "rigid" assumption is gone. The second, $\det(\mathbf{R}) = 1$, excludes reflections. Orthogonal matrices come in two kinds, determinant $+1$ and determinant $-1$; the latter mirror the body, turning a left hand into a right hand. No physical rotation does that, so the group of rotations is the determinant-$+1$ half. This is why the group is called *special* orthogonal rather than just orthogonal (@fig:transforms).

![Rigid-body motion in the plane and in space: the homogeneous transformation matrices for $SE(2)$ and $SE(3)$, and the definition of the rotation group $SO(n)$. This slide is the notation anchor for the whole chapter. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_004.jpg){#fig:transforms width=82%}

### Chaining frames

One frame is never enough. A self-driving car has a base frame at its center of gravity, where the control commands are issued, and a lidar and camera bolted to the roof, each with its own frame. When the perception system detects a pedestrian, it detects them in the *sensor's* frame. The controller needs them in the *base* frame. Getting from one to the other is a product:

$$\mathbf{T}^{\text{base}}_{\text{ped}} = \mathbf{T}^{\text{base}}_{\text{sensor}} \, \mathbf{T}^{\text{sensor}}_{\text{ped}}$$ {#eq:chain}

**In words.** To express where something is relative to the car, compose where it is relative to the sensor with where the sensor is relative to the car.

**The symbols.** $\mathbf{T}^{A}_{B}$ is the transform giving the pose of frame $B$ expressed in frame $A$. Read the superscript as "in the frame of" and the subscript as "of the thing".

**Why this shape.** The superscript-subscript pattern is what makes long chains checkable: adjacent transforms must share the inner label, and the outer labels survive. $\mathbf{T}^{\text{base}}_{\text{sensor}} \mathbf{T}^{\text{sensor}}_{\text{ped}}$ cancels "sensor" and leaves you with the pedestrian in the base frame, in the same way that units cancel in a physics calculation. Write it in the wrong order and the labels do not line up, which is a useful mechanical check on work that is otherwise easy to get subtly wrong.

Where does $\mathbf{T}^{\text{base}}_{\text{sensor}}$ come from? From measuring it — a procedure called **sensor calibration**, which the course does not cover and which in practice is a persistent source of real-world failure. Chapter 9 returns to this from the far end: a policy trained with a camera in one pose stops working when somebody bumps the camera, precisely because a transform the model implicitly relied on has silently changed.

## Articulated bodies: links, joints, and degrees of freedom

A real robot is not one rigid body but many, connected in a chain: an **articulated** rigid body. Three words cover the anatomy. A **link** is one rigid body. A **joint** connects two links and constrains how they may move relative to each other. An **end-effector** is the device at the end of the chain that does the work — a gripper, a hand, a suction cup.

Chaining transforms along the links, exactly as in @eq:chain, answers questions like "where is this humanoid's hand relative to its torso?" The examples in the course are a Franka Emika arm with seven joints and the SO-101, the small, inexpensive arm used for the course's own projects. The SO-101 is mechanically much simpler, and mathematically identical.

End-effectors deserve a moment, because the choice of gripper decides how hard the learning problem is. A **suction gripper** has a binary action: vacuum on or off. It is the cleanest possible action space, which is one reason industrial pick-and-place uses it. A **parallel gripper** has one degree of freedom, the distance between two fingers; the Franka and the SO-101 both use one. A **dexterous hand** has twenty or more degrees of freedom, and every one of them is a dimension the policy has to get right. Nothing about the learning algorithm changes across these three, but the size of the space it searches changes by orders of magnitude.

The **degrees of freedom** of a robot is the number of independent parameters you need to specify its configuration completely. You can count them from the parts, using a result from the nineteenth-century kinematics literature:

$$\mathrm{dof} = \underbrace{m\,(N-1)}_{\text{freedoms if links were free}} - \underbrace{\sum_{i=1}^{J} c_i}_{\text{freedoms removed by joints}}$$ {#eq:kutzbach}

**In words.** Count the freedom the links would have if they floated independently, then subtract everything the joints take away.

**The symbols.** $m$ is the number of freedoms of a single rigid body in the space being considered — 3 in the plane, 6 in space. $N$ is the number of links **including the ground link**, the fixed base the robot is bolted to. $J$ is the number of joints, and $c_i$ is the number of constraints imposed by joint $i$. A revolute joint — a hinge, like an elbow — permits one rotation and forbids everything else, so it removes 2 constraints in the plane and 5 in space.

**Why this shape.** The formula is called the **Chebychev–Grübler–Kutzbach formula**, and its logic is subtraction rather than addition because constraints compose more simply than freedoms do. The $N-1$ rather than $N$ is the ground link: it is not free to move, so it contributes nothing. The naive alternative — adding up the freedom each joint permits — gives the right answer for a simple chain and the wrong answer the moment the mechanism has a loop, because a joint in a loop is constrained by the rest of the loop as well as by itself.

### Worked example: counting the degrees of freedom of an arm

Take the Franka. It has seven revolute joints. Counting links: seven moving links plus the fixed base, so $N = 8$. It moves in space, so $m = 6$, and each revolute joint removes $c_i = 5$ constraints with $J = 7$ joints:

$$\mathrm{dof} = 6\,(8-1) - 7 \times 5 = 42 - 35 = 7.$$

Seven, which is what "7-DoF arm" means and what you would have guessed by counting motors. The formula is not interesting when it agrees with the obvious count; it is interesting when it does not. Take a planar two-link arm, the standard textbook 2R. Two moving links plus ground gives $N = 3$; planar motion gives $m = 3$; two revolute joints in the plane remove 2 constraints each:

$$\mathrm{dof} = 3\,(3-1) - 2\times 2 = 6 - 4 = 2.$$

Also two, again matching the motor count. Now close the chain — connect the far end of the second link back to the ground through a third revolute joint, making a four-bar-style loop. Now $N = 4$ and $J = 4$:

$$\mathrm{dof} = 3\,(4-1) - 4\times2 = 9 - 8 = 1.$$

Four motors, one degree of freedom. This is the case where counting joints misleads and the formula does not: closing a loop consumed three of the four freedoms, and the mechanism now has exactly one way to move (@fig:dof).

![Joint types with their freedoms $f$ and their constraints $c$ in the plane and in space, together with the Chebychev–Grübler–Kutzbach formula. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_010.jpg){#fig:dof width=80%}

## Three spaces: configuration, workspace, task

Robotics keeps three different spaces in play, and confusing them is a reliable way to get lost.

The **configuration space**, or C-space, written $\mathcal{C}$, is the set of all configurations the robot can take. For an arm, a point in $\mathcal{C}$ is a vector of joint angles. What makes C-space more than a box of numbers is its **topology**, which depends on the joints. A point sliding on a plane has the topology of $\mathbb{E}^2$. A two-revolute-joint arm has the topology of a **torus**, $\mathbb{T}^2 = S^1 \times S^1$, because each joint angle wraps around: one full turn brings it back where it started.

That last point is not decorative, and it is the first place in this book where a piece of classical geometry constrains a neural network. A policy that outputs joint angles is outputting points on a torus, and on a torus distance is not what a naive network assumes. A joint at 356° and a joint at 1° are five degrees apart, not 355°. Train a network with a plain squared-error loss on raw angle values and it will believe the second number, take the long way round, and swing the joint most of a full rotation to reach a target that was nearly under its nose. Representing angles in a way that respects the wrap — sines and cosines, or a distance that knows about the modulus — is one of those details that separates code that works from code that almost works (@fig:cspace).

![Configuration-space topologies for various mechanisms, reproduced in the lecture from Lynch and Park's *Modern Robotics*. A revolute joint contributes a circle $S^1$, so a two-joint arm's configuration space is a torus rather than a rectangle. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_011.jpg){#fig:cspace width=78%}

The **workspace** is different: it is the set of points in the physical world the end-effector can reach. Robot datasheets publish it as a reach envelope — the ABB IRB-120's is the example in the lecture. The workspace lives in the world; the configuration space lives in the robot's joints.

Obstacles connect the two, and the connection is where classical planning made its stand. An obstacle occupies some region of the workspace, and that region maps to a forbidden region of the configuration space: the set of joint angles that would put some part of the robot inside the obstacle. Motion planning in the 1990s built that forbidden set explicitly and searched the free space around it, an approach given book-length treatment by Latombe in 1991 and LaValle in 2006. It works, and it does not scale: constructing and searching C-space becomes intractable as the dimension grows, and a 7-DoF arm with a moving obstacle is already uncomfortable. The shift this book documents is to skip the explicit construction and learn a policy that *implicitly* knows where the obstacles are — that has, in effect, a feel for the free space without ever representing it. That is the trade the field has made: give up the geometric guarantee, gain the ability to cope with a world you did not model.

The **task space** is the third space, and it is the one that is easy to overlook. It is the space in which the objective naturally lives, independent of the robot's body. Cleaning a whiteboard is a task on a two-dimensional surface: the task space is $\mathbb{R}^2$, whether the cleaning is done by a humanoid, a fixed arm, or a drone with a sponge. The task space belongs to the task, not the machine.

Comparing dimensions of these spaces tells you something immediately. If the task space has fewer dimensions than the robot has degrees of freedom, the robot is **redundant** for that task. The Franka has 7 degrees of freedom; a full end-effector pose in $SE(3)$ has 6; so a Franka holding a mug in a fixed pose still has one degree of freedom left over. Concretely, the elbow can swing through a family of positions while the mug does not move at all. This is **null-space motion**, and it is a resource: it is what lets an arm reach around an obstacle without disturbing the thing it is carrying.

## Forward and inverse kinematics

With the spaces named, two questions remain, and they are inverses of each other.

**Forward kinematics** asks: given the joint angles, where is the end-effector? Chain the transforms and read off the answer.

$$x = f(q), \qquad q \in \mathbb{R}^n,\quad x \in SE(3), \qquad f: \mathcal{C} \to X$$ {#eq:fk}

**In words.** There is one definite end-effector pose for any given set of joint angles.

**The symbols.** $q$ is the joint configuration, a vector of $n$ joint values; $x$ is the resulting end-effector pose, an element of $SE(3)$; $f$ is the forward-kinematics map from configuration space $\mathcal{C}$ to task space $X$.

**Why this shape.** $f$ is a function, deterministic and cheap: multiply the transforms. What it is *not* is injective. Many distinct configurations produce the same pose — that is redundancy, restated. So $f$ has a well-defined value everywhere and no well-defined inverse, which is exactly the difficulty of the next paragraph.

**Inverse kinematics** asks the useful question: given a target pose, what joint angles get me there?

$$q = f^{-1}(x), \qquad f^{-1}: X \to \mathcal{P}(\mathcal{C})$$ {#eq:ik}

**In words.** Solving for the joints that achieve a desired pose gives you, in general, a *set* of answers rather than one.

**The symbols.** $\mathcal{P}(\mathcal{C})$ is the power set of the configuration space — the set of all subsets — so writing $f^{-1}: X \to \mathcal{P}(\mathcal{C})$ says the "inverse" returns a collection of configurations.

**Why this shape.** Writing $f^{-1}$ as set-valued is not pedantry; it is the honest bookkeeping for a map that is not one-to-one. For some robots the set can be written down in closed form. For many it cannot, and for some target poses it is empty — the pose is out of reach. Any code that treats inverse kinematics as a function returning one answer is making a choice, and it is better to know that you are making it.

This is where the chapter's two halves meet. A learned policy typically predicts a *target pose* for the end-effector, because pose is the natural language of the task. Something then has to convert that pose into joint angles, and that something is inverse kinematics. It sits between the policy and the motors in almost every system in this book.

When there is no closed form, solve it numerically as an optimization. Define the error between where the end-effector currently is and where you want it, and descend:

$$L(q) = \tfrac{1}{2}\,\big\| f(q) - x_{\text{target}} \big\|^2, \qquad \nabla_q L(q) = \mathbf{J}(q)^\top \, e, \qquad e = f(q) - x_{\text{target}}$$ {#eq:iksolve}

$$q \leftarrow q - \eta\, \mathbf{J}(q)^\top \big( f(q) - x_{\text{target}} \big)$$ {#eq:ikstep}

**In words.** Measure how far the end-effector is from the target, work out how each joint would move it, and nudge every joint in the direction that shrinks the gap. Repeat.

**The symbols.** $L$ is the squared distance between the current pose and the target — the factor of one half is there only to cancel the 2 that differentiation produces. $e$ is the pose error. $\mathbf{J}(q) = \partial f / \partial q$ is the **kinematic Jacobian**, the matrix whose $(i,j)$ entry says how much the $i$-th component of the end-effector pose changes per unit change in joint $j$. $\eta$ is a step size. The arrow $\leftarrow$ means assignment: this is an iterative update, not an equation to solve once.

**Why this shape.** The transpose is doing the work. $\mathbf{J}$ maps joint velocities to end-effector velocities; $\mathbf{J}^\top$ maps a desired end-effector correction back to the joint changes that would produce it. The obvious alternative is to invert the Jacobian rather than transpose it, which converges faster — but $\mathbf{J}$ is not square for a redundant robot and is singular at the configurations where the arm is stretched straight, so inverting it fails exactly where robots are most likely to be. The transpose always exists. It is the choice that never blows up, at the cost of taking more steps.

> **Editor's note.** The lecture writes this update with $\theta$ for the joint angles and $\alpha$ for the step size, following the convention of Lynch and Park. This book reserves $\theta$ for the parameters of a learned model and $\eta$ for a learning rate, and writes joint configurations as $q$ throughout — otherwise $J(\theta)$ would mean both the Jacobian here and the reinforcement-learning objective of @eq:objective, which would be genuinely confusing. The mathematics is unchanged. See the notation table in the back matter.

## Getting there smoothly: trajectory generation

Inverse kinematics tells you the joint angles at the destination. It does not tell you how to get there, and the robot cannot teleport. You need a **trajectory**: a sequence of intermediate configurations, spaced in time, that the low-level controller can track.

The simplest choice is a straight line in joint space, **linear interpolation**:

$$q(\lambda_i) = q_{\text{start}} + \lambda_i \,\big(q_{\text{target}} - q_{\text{start}}\big), \qquad \lambda_i = \frac{i}{N}, \qquad N = \lceil T \cdot f_c \rceil$$ {#eq:lerp}

**In words.** Divide the motion into equal steps and move an equal fraction of the way at every step.

**The symbols.** $q_{\text{start}}$ and $q_{\text{target}}$ are the configurations at the two ends. $T$ is the duration of the motion in seconds and $f_c$ is the control frequency in hertz, so $N$ is the number of waypoints, rounded up. $\lambda_i \in [0,1]$ is the normalized progress along the path at waypoint $i$: zero at the start, one at the end.

**Why this shape.** Nothing is wrong with the geometry — the path is the shortest one in joint space. Everything is wrong with the timing, and this is worth seeing precisely rather than being told. Because $\lambda$ advances by a constant $1/N$ per step, the joint velocity is constant throughout the motion, which means it goes from zero to its full value in a single control step at the start and back to zero in a single step at the end. Acceleration is the rate of change of velocity, so an instantaneous velocity change is an infinite acceleration: two spikes, one at each end. Real motors cannot produce them, so the robot lags, overshoots, and shakes. The technical name for the rate of change of acceleration is **jerk**, and linear interpolation has an unbounded amount of it at the endpoints. On a small arm this shows up as an audible clunk. On an industrial arm it is a maintenance problem.

The fix is to keep the straight-line path and change the *schedule* along it — to move slowly at first, quickly in the middle, and slowly again at the end. Any function of progress with the right boundary behavior will do; the standard choice is a fifth-order polynomial, because fifth order is the lowest that can satisfy all six conditions we want:

$$q(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3 + a_4 t^4 + a_5 t^5$$ {#eq:quintic}

$$q(\lambda) = q_{\text{start}} + \big(q_{\text{target}} - q_{\text{start}}\big)\, g(\lambda), \qquad g(\lambda) = 10\lambda^3 - 15\lambda^4 + 6\lambda^5$$ {#eq:quinticscaling}

**In words.** Follow the same straight line, but pace yourself along it with a smooth ramp that starts and ends at a standstill.

**The symbols.** The six coefficients $a_0, \dots, a_5$ in @eq:quintic are fixed by six boundary conditions: the start and end positions, zero velocity at both ends, and zero acceleration at both ends. @eq:quinticscaling is the same thing rewritten as a **time-scaling function** $g(\lambda)$ that maps normalized progress to normalized displacement, which is the more useful form because it is the same for every joint.

**Why this shape.** Count the constraints and the order follows. Position at two ends, velocity at two ends, acceleration at two ends: six conditions, so six free coefficients, so a polynomial of degree five. A cubic could match positions and velocities but not accelerations, which is why cubic trajectories still jerk — less violently than linear ones, but they do. You can check that $g$ has the properties claimed: $g(0)=0$ and $g(1) = 10 - 15 + 6 = 1$, so the endpoints are right, and $g'(\lambda) = 30\lambda^2 - 60\lambda^3 + 30\lambda^4 = 30\lambda^2(1-\lambda)^2$, which vanishes at both $\lambda = 0$ and $\lambda = 1$ — the standstill at each end — and does so quadratically, which is what also kills the acceleration there.

### Worked example: moving one joint, two ways

Rotate a single joint of an SO-101 from 0° to 30° in one second, at a control frequency of 30 Hz. Then $N = \lceil 1.0 \times 30 \rceil = 30$ waypoints, and $\lambda_i = i/30$.

Under linear interpolation the joint advances $30° / 30 = 1°$ per step, every step. In velocity terms that is $1° \times 30\,\mathrm{Hz} = 30°/\mathrm{s}$, constant, from the first step to the last — and zero immediately before and after. The velocity profile is a rectangle.

Under quintic time scaling the same motion takes the same second, so the *average* velocity is the same 30°/s, but the peak is higher. The peak of $g'$ is at $\lambda = 0.5$:

$$g'(0.5) = 30 \times (0.5)^2 \times (1 - 0.5)^2 = 30 \times 0.25 \times 0.25 = 1.875.$$

So the fastest the joint ever moves is $1.875 \times 30°/\mathrm{s} = 56.25°/\mathrm{s}$, at the halfway point, and it eases to a stop at both ends. Sampling the trajectory at a few waypoints makes the difference concrete:

| $i$ | $\lambda_i$ | Linear: $q$ | Quintic: $g(\lambda_i)$ | Quintic: $q$ |
|---|---|---|---|---|
| 0 | 0.000 | 0.0° | 0.000 | 0.0° |
| 3 | 0.100 | 3.0° | 0.009 | 0.3° |
| 8 | 0.267 | 8.0° | 0.114 | 3.4° |
| 15 | 0.500 | 15.0° | 0.500 | 15.0° |
| 22 | 0.733 | 22.0° | 0.879 | 26.4° |
| 27 | 0.900 | 27.0° | 0.991 | 29.7° |
| 30 | 1.000 | 30.0° | 1.000 | 30.0° |

The two agree at the ends and at the midpoint and disagree everywhere else. The quintic has barely moved after a tenth of a second and is nearly finished after nine tenths, having spent its speed in the middle where the motors can deliver it. The price is a peak velocity 87.5% above the average, which has to fit inside the joint's limits: a motion that is feasible under linear interpolation at constant speed may be infeasible under quintic scaling at the same duration, and the fix is to slow the whole motion down. This trade — smoothness for peak speed — is why industrial arms, Frankas included, use quintic or higher-order time scaling as standard (@fig:lerp).

![Velocity and acceleration profiles for linear interpolation against quintic time scaling. Linear interpolation's constant velocity implies impulsive acceleration at both ends; the quintic ramps velocity smoothly from zero and back, at the cost of a higher peak. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_026.jpg){#fig:lerp width=85%}

## Closing the loop: PID control

Even a perfectly smooth trajectory will not be followed exactly. Friction resists the motion, gravity pulls the arm down, air resistance and payload and manufacturing tolerance all conspire, and the joint ends up somewhere other than where the plan said. The remedy is feedback: measure the error and correct it. The workhorse is the **PID controller**.

$$u(t) = K_p\, e(t) + K_i \int_0^{t} e(t')\,\mathrm{d}t' + K_d\, \frac{\mathrm{d}e(t)}{\mathrm{d}t}, \qquad e(t) = q_{\text{desired}}(t) - q_{\text{measured}}(t)$$ {#eq:pid}

$$u_k = K_p e_k + K_i \sum_{j=0}^{k} e_j\,\Delta t + K_d \frac{e_k - e_{k-1}}{\Delta t}, \qquad \Delta t = 1/f_c$$ {#eq:pidd}

**In words.** Push harder the further you are from where you should be, keep pushing if a small error refuses to go away, and ease off if you are closing the gap quickly.

**The symbols.** $e$ is the tracking error, the difference between the commanded and measured joint position. $u$ is the control signal sent to the motor. $K_p$, $K_i$ and $K_d$ are gains — three numbers to be tuned. @eq:pidd is the discrete form actually implemented: $e_k$ is the error at control step $k$, the integral becomes a running sum, the derivative becomes a difference between consecutive steps, and $\Delta t$ is the control period, the reciprocal of the control frequency.

**Why this shape.** The three terms exist because each fixes what the others cannot, and the lecture's mechanical analogy is the fastest way to see it (@fig:pid). The proportional term is a **spring**: the further off you are, the harder it pulls. A spring alone leaves a steady offset, because when the error becomes small the restoring force becomes small, and a constant disturbance like gravity can hold the joint just below its target indefinitely. The integral term is **anti-gravity**: it accumulates the leftover error over time until the accumulated push is enough to close it, which is exactly what defeats a constant disturbance. A spring plus anti-gravity now overshoots, because nothing opposes the incoming velocity. The derivative term is a **damper**: it responds to how fast the error is changing, resisting the approach and settling the joint rather than letting it ring.

![The three terms of a PID controller as mechanical parts: proportional as a spring, integral as anti-gravity, derivative as a damper. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_028.jpg){#fig:pid width=72%}

One practical warning that connects directly to the second half of the book. The derivative term needs a recent measurement to react to. If the control frequency is too low, the damper is always responding to stale information and stops damping — the loop rings or goes unstable. This puts a floor under the control rate, and that floor is what makes the inference speed of a learned policy a hard engineering constraint rather than a nice-to-have. When Chapter 10 reports a reasoning policy that produces one action every four seconds, the reason that is a serious problem, rather than merely slow, is here.

## Are we done?

We can now describe where a robot is, work out the joint angles that put its hand somewhere specific, generate a smooth path there, and track that path against disturbance. For a welding arm in a cage this is genuinely the whole job, and it is why classical robotics succeeded so completely inside the factory.

It is not the whole job for a robot in a kitchen, and the missing piece is not a better controller. Everything so far assumed somebody had already decided *where the hand should go*. Deciding that — for a long-horizon goal, in a world that is noisy, unmapped, and changing while you work in it — is a different kind of problem, and it needs a different kind of formalism. That formalism is the rest of this chapter.

## From control to decision-making

Here is the task the second half has to describe. A bimanual ALOHA robot — fourteen degrees of freedom across two arms, running at high frequency — is asked to cut a piece of sushi. It has to grasp the knife, reposition the roll, make a precise cut, and do all of it in sequence without dropping anything. The low-level controllers of the previous sections will faithfully track whatever motion is requested. The question is what to request.

> **Editor's note.** The sushi-cutting example is the running demonstration of *The Ingredients for Robotic Diffusion Transformers* (Dasari, Mees et al., ICRA 2024). It returns in Chapter 6 as the task that motivates scaling diffusion policies, and in Chapter 9 as one of the tasks a single cross-embodiment checkpoint performs.

The object that answers the question is a **policy**, and the fastest way to understand it is by analogy with a classifier. An image classifier is a function $f(y \mid x)$: an image goes in, a distribution over labels comes out. A policy is a function $\pi_\theta(a \mid o)$: an observation goes in, a distribution over actions comes out. Same shape, same machinery, in many cases the same architecture. At each time step $t$ the robot observes $o_t$ and takes action $a_t$; $t$ counts integer steps, though in reality the steps are milliseconds on a clock.

Then there is the difference, and it is not small. Mislabeling a cat as a dog does not change the cat. The next image in the test set arrives regardless, unaffected by what the classifier said about the last one. **Choosing a wrong action changes the world.** Steer into a ditch and the next observation is not a slightly harder version of the same problem; it is a completely different problem, and one you created. Every subsequent decision is made in a situation your own mistake produced.

This is the single fact that separates robot learning from supervised learning, and it will resurface as a specific failure in Chapter 3, as the reason for the whole apparatus of Chapters 4 and 5, and as an evaluation problem in Chapter 9. It is worth carrying explicitly.

One more property before the formalism. Policies are in general **stochastic**: they give a distribution over actions rather than a single action. A **deterministic** policy is the special case that puts all of its probability on one action. The reason to allow the general case is the same reason Chapter 1 wrote the policy as a distribution and Chapter 3 will make unavoidable: there is often more than one right answer, and a formalism that cannot say so will average the right answers into a wrong one.

## State and observation are not the same thing

Two symbols that are easy to conflate and important to separate.

The **state** $s_t$ is the ground truth: the exact positions, velocities and orientations of everything that matters. The **observation** $o_t$ is what a sensor reports, which is a lossy function of the state. The example that makes the distinction stick: consider a road on a clear day and the same road on a snowy night. The observations are wildly different — different pixels, different visibility, different everything. **The state is the same.** The road is where it was. Weather changes what you can see, not what is there.

Robotics almost always works with observations, so the policy usually conditions on partial information. The two cases are written:

$$\pi_\theta(a_t \mid s_t) \quad\text{(fully observed)}, \qquad \pi_\theta(a_t \mid o_t) \quad\text{(partially observed)}$$ {#eq:obspolicy}

**In words.** In the lucky case the policy sees the true situation; in the real case it sees a shadow of it and must act anyway.

**The symbols.** As above, with $\theta$ the learned parameters.

**Why this shape.** The distinction earns its keep because the theory of the next three chapters is stated for the fully observed case and applied to the partially observed one. Most of the guarantees in this book — the convergence of value iteration, the sufficiency of the current state for optimal action — hold for $s_t$ and are then used with $o_t$, where they do not strictly hold. Knowing which of the two you have is knowing which of your guarantees are real. Chapter 7 takes this seriously enough to build history into the policy, precisely because one observation is not a state.

For the theory, we make the assumption that lets everything else work.

## The Markov property

> If you know $s_2$, then $s_1$ tells you nothing more about $s_3$.

That is the **Markov property**, and the content of it is a claim about the state: the state already contains all the information about the world that is relevant to what happens next, so the past adds nothing on top of it. The dynamics are then a one-step conditional distribution:

$$s_{t+1} \sim P(\,\cdot \mid s_t, a_t)$$ {#eq:markov}

**In words.** Where the world goes next depends only on where it is now and what the robot does now.

**The symbols.** $P(s_{t+1} \mid s_t, a_t)$ is the **transition** or **dynamics** function: the probability of landing in state $s_{t+1}$ given the current state and action.

**Why this shape.** Without the Markov property, the object you would have to condition on is the entire history $(s_0, a_0, \ldots, s_t)$, which grows without bound and makes both learning and planning hopeless. With it, everything reduces to a one-step recursion — and Chapter 4 will get its central algorithm out of exactly that reduction. Two cautions. First, the property is a statement about the *state*, not about the world: it holds when the state is defined richly enough, which is why "put velocity in the state" is standard advice. Second, Markov does not mean predictable. Even with full knowledge of the state, $P$ can be broadly spread — ice under a tire, a slipping gripper — and the future genuinely uncertain.

### A note on notation, and why two conventions exist

This course writes states, actions and rewards as $s$, $a$, $r$. That convention comes from **Richard Bellman's** dynamic programming in the 1950s and 60s, and through it from the reinforcement-learning literature.

There is an older and equally standard alternative. Optimal control theory, in the tradition of **Lev Pontryagin**, writes state, action and *cost* as $x$, $u$, $c$. The two describe the same mathematics with the sign flipped: $r(s,a) = -c(x,u)$. Maximizing reward and minimizing cost are the same problem.

This matters for reading, not for doing. Half of the relevant literature — and most of the classical robotics literature, including the PID section above, where the control signal was $u$ — uses the control convention; the other half uses Bellman's. This book uses $s$, $a$, $r$ throughout, as the course does, and the back matter's notation table records the correspondence.

## The Markov decision process

Now the formalism, which is nothing more than the pieces above collected into a tuple:

$$M = \langle\, \mathcal{S},\ \mathcal{A},\ \mathcal{P},\ \mathcal{R} \,\rangle$$ {#eq:mdp}

**In words.** A decision problem is specified by the situations that can occur, the choices available, the physics that connects them, and what counts as good.

**The symbols.** $\mathcal{S}$ is the **state space**, with $s_t \in \mathcal{S}$. $\mathcal{A}$ is the **action space**, with $a_t \in \mathcal{A}$. $\mathcal{P}$ is the **transition kernel**, whose probabilities are the $P(s_{t+1} \mid s_t, a_t)$ of @eq:markov. $\mathcal{R}$ is the **reward function**, $r: \mathcal{S} \times \mathcal{A} \to \mathbb{R}$, with the realized reward at step $t$ written $r_t = R(s_t, a_t, s_{t+1})$.

**Why this shape.** Four components, no more, is the point. The **Markov decision process** is the smallest description that supports the question "what should I do?", and its value is that it is *indifferent to the body*. A 27-degree-of-freedom humanoid and a chess-playing program are both instances of @eq:mdp, differing only in what $\mathcal{S}$ and $\mathcal{A}$ contain. That indifference is why the same algorithms appear in both literatures, and it is what makes it possible to write one book about robots that borrows freely from work on games and language (@fig:mdp).

![The agent–environment loop and the Markov decision process tuple. The agent observes a state, takes an action, and receives a reward and a next state from the environment. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_038.jpg){#fig:mdp width=72%}

Each of the four components comes in variants, and the variants determine which algorithms are available.

**The state space** may be **discrete** or **continuous**. Chess is discrete: there is no position halfway between two squares. A robot arm is continuous: joint angles are real numbers. The consequence is immediate and severe. If the state space is continuous you cannot keep a table of one value per state, because there are uncountably many states. Everything must go through a **function approximator** — in practice a neural network. Chapter 4 spends its first half on tabular methods that assume the discrete case and its second half escaping to the continuous one.

**The action space** likewise. Discrete actions are what a keyboard gives you: four arrow keys, a fixed menu. Continuous actions are what VR teleoperation gives you: smooth motion in any direction. Robots want the continuous case, and it is harder, because algorithms built around "try every action and pick the best" have no finite set to try.

**The transition model** may be **deterministic**, $s_{t+1} = f(s_t, a_t)$, or **stochastic**, $s_{t+1} \sim P(\cdot \mid s_t, a_t)$. Turn a wheel five degrees on dry asphalt and the arc is predictable. Do it on ice, with worn tires, sensor noise, and a motor that overshoots, and it is not. Robotics uses the stochastic form because the deterministic one is a fiction outside simulation.

**The reward function** may be **sparse** or **dense**, and the difference decides whether learning happens at all. A sparse reward gives 1 if the object was grasped and 0 otherwise, and nothing in between: it is what you actually care about, and it is nearly useless as a training signal, because a policy that has never once succeeded receives the same zero for every one of its attempts and has no gradient to climb. A dense reward gives partial credit continuously — for example the negative Euclidean distance from the gripper to the target — and dramatically accelerates learning by telling the robot when it is getting warmer.

> **Editor's note.** The lecture's evidence for this is a video from Mees's own PhD work: *Affordance Learning from Play for Sample-Efficient Policy Learning* (Borja, Mees et al., ICRA 2022), where a sparse reward fails to learn pick-and-place at all and a dense reward learns it. The lecture is careful to add that sparse rewards might still work given far longer training — the failure is one of sample efficiency, not of possibility in principle. Chapter 4's exploration discussion and Chapter 11's discussion of autonomous improvement both come back to where dense rewards are supposed to come from when nobody hand-writes them.

## Trajectories, horizons, and what we are actually maximizing

A run of the robot produces a **trajectory**, the alternating sequence of states and actions:

$$\tau = (s_0, a_0, s_1, a_1, \ldots, s_T)$$

How likely is a particular trajectory? Multiply out the choices and the physics, step by step:

$$p_\pi(\tau) = \underbrace{\rho_0(s_0)}_{\text{where we start}} \prod_{t=0}^{T-1} \underbrace{\pi(a_t \mid s_t)}_{\text{what the policy does}} \; \underbrace{P(s_{t+1} \mid s_t, a_t)}_{\text{what physics does}}$$ {#eq:trajprob}

**In words.** The chance of seeing a particular sequence of events is the chance of starting where it starts, times the chance the policy picks each of its actions, times the chance the world responds as it did, all multiplied together.

**The symbols.** $\rho_0$ is the **initial-state distribution**, the spread of situations the robot might find itself in at the beginning. $T$ is the horizon.

**Why this shape.** The factorization is a direct consequence of the Markov property: because each step depends only on the previous state and action, the joint probability of the whole sequence factors into a product of one-step terms. If the dynamics depended on the full history, no such factorization would exist and none of the algorithms in Chapters 4 and 5 would be derivable. Notice also that the product splits cleanly into terms the policy controls and terms it does not. That split is the hinge of the entire policy-gradient derivation in Chapter 5: the terms without $\theta$ in them will differentiate to zero and disappear, leaving something computable without knowing the physics at all (@fig:trajprob).

![The probability of a trajectory factorizes into the initial-state distribution and, at every step, the policy's action probability times the transition probability. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_043.jpg){#fig:trajprob width=80%}

The **horizon** is how long the episode runs, and there are two cases. A **finite horizon** imposes a strict step limit — five seconds to grab a moving object. This changes optimal behavior in a way worth noticing: near the deadline, an agent with nothing to lose should gamble, because a risky action with a small chance of success beats a safe action with no chance of finishing in time. An **infinite horizon** runs forever, or until a terminal state; navigation and most long-running tasks are of this kind.

The infinite case has a problem. If reward accumulates forever, total rewards can be infinite, and infinities cannot be compared — a policy earning one point per second and a policy earning a thousand both total infinity. The fix is to shrink distant rewards geometrically with a **discount factor** $\gamma \in [0,1)$, so the sum converges and near rewards count for more than far ones. This is a modeling choice with real consequences, and it can be read two ways: as a mathematical device to make the sum finite, or as a statement that the robot should prefer sooner to later, which is often true. It is also a knob that changes behavior, and Chapter 4 will show it changing behavior.

Now everything assembles into the objective. The accumulated reward, or **return**, is

$$G = \sum_{t=0}^{T-1} r_t \qquad\text{or}\qquad G = \sum_{t\ge 0}\gamma^t r_t$$ {#eq:return}

for the finite and infinite cases. But the world is stochastic and so is the policy, so one trajectory's return tells you little. What we care about is the **expected** return:

$$J(\pi) = \mathbb{E}_{\tau \sim p_\pi(\tau)}\Big[\sum_{t \ge 0} \gamma^t r_t\Big], \qquad \pi^* = \arg\max_\pi\, J(\pi)$$ {#eq:objective}

**In words.** Score a policy by the average total reward it earns over all the ways things could unfold, and call a policy optimal when no other policy scores higher.

**The symbols.** $J(\pi)$ is the objective — a single number summarizing how good a policy is. $\mathbb{E}_{\tau \sim p_\pi(\tau)}$ is an average over trajectories drawn from the distribution @eq:trajprob induces. $\pi^*$ is an optimal policy. When the policy is a network we write $J(\theta)$ and optimize over $\theta$ instead of over abstract policies.

**Why this shape.** The expectation is not a technicality; it is what makes the problem tractable, and Chapter 4 opens by showing why. A reward can be a step function — plus one for staying on the road, minus one for going off the cliff — with zero gradient everywhere and an undefined jump in the middle. You cannot descend that. But the *expectation* of that reward under a stochastic policy is smooth in the policy's parameters, because moving the parameters slightly moves probability mass slightly across the discontinuity. Optimizing distributions rather than actions is what turns a non-differentiable objective into a differentiable one. This is the deep reason reinforcement learning is built out of expectations, and it will not be obvious again until you have seen the alternative fail (@fig:objective).

![From return to expected return to the optimal policy: the objective that both imitation learning and reinforcement learning are trying to reach. Credit: course slides, Lecture 2.](../slides_png/lecture02/slide_045.jpg){#fig:objective width=78%}

@eq:objective is the target for the next three chapters. Imitation learning will approach it without ever writing down a reward, by copying an expert who is assumed to be near-optimal. Reinforcement learning will attack it directly. Both are trying to maximize the same quantity.

## Where this breaks

The formalism is clean, and each place it is clean is a place where reality is not.

**The Markov property is an assumption, and in robotics it is usually false as stated.** What a robot has is $o_t$, not $s_t$, and one camera frame does not determine the future: it cannot tell you which way the pedestrian is walking, or that the object you need is behind the cupboard door. Strictly, a robot faces a *partially observed* Markov decision process, and the guarantees derived for the fully observed case do not transfer. The field's pragmatic response is to stuff more into the observation — stack recent frames, include velocities, add history through a sequence model, as Chapter 7 does — which makes the assumption less wrong without making it true.

**Discounting distorts the objective it makes tractable.** A discount factor is introduced to make an infinite sum converge, and then it is a parameter that changes what the optimal policy is. A robot with $\gamma = 0.9$ and a robot with $\gamma = 0.999$ want different things, and neither of them wants exactly what the task designer wanted.

**Rewards have to come from somewhere, and writing them is harder than it looks.** Everything downstream of @eq:objective assumes a reward function exists. In simulation it does. On real hardware, someone must decide what to measure and how to compute it from sensors, and the dense reward that makes learning fast is exactly the one most likely to be gameable — a distance-based reward for reaching can be maximized by hovering next to the object without grasping it. This is why so much of the second half of this book is about avoiding the problem entirely: imitation needs no reward, and Chapter 10's reinforcement learning works from a verifiable binary outcome rather than a hand-shaped signal.

**The clean separation between control and decision-making leaks.** This chapter presented a tidy stack: the policy chooses a target pose, inverse kinematics converts it to joint angles, PID tracks them. Every layer of that stack introduces error, and the layers do not know about each other. Inverse kinematics may return a configuration that is legal but takes the arm through a collision. The PID controller tracks a trajectory faithfully while the object it was meant to grasp rolls away. Chapter 11 reports this as one of the field's live problems: mobile manipulation today has a hard handoff between a classical navigation stack and a learned manipulation policy, and nobody is happy about it.

**Continuous state and action spaces invalidate the algorithms that the formalism most naturally suggests.** The MDP as written invites you to iterate over states and maximize over actions. A 7-DoF arm with camera input permits neither. The whole architecture of Chapter 4 — function approximation, sampling, learned maximizers — exists to work around the fact that the obvious algorithm is unavailable in the case we care about.

## What this connects to

Chapter 1 argued that robot learning is what happens when hand-coded logic runs out. This chapter built the two languages that the alternatives are written in.

The first half — frames, kinematics, trajectories, PID — is the layer every learned policy stands on. It appears again wherever the physical body intrudes on the learning problem: the gripper conventions that had to be reconciled across datasets in Chapter 9, the control frequencies from 5 to 50 Hz that force a cross-embodiment model to predict action chunks of different lengths, the inference-speed budget that Chapter 10's reasoning policies blow through. The Jacobian and the PID gains will not be mentioned again, but the constraints they represent never go away.

The second half is the foundation of Chapters 3 through 5. @eq:objective is the objective all three chapters share. Chapter 3 pursues it by imitation: assume access to an expert, copy it, and discover that the compounding-error problem — which is precisely the "your action changes the world" observation above, made quantitative — puts a ceiling on how well copying can work. Chapters 4 and 5 pursue it by reinforcement: Chapter 4 through value functions, using the Markov property to turn @eq:objective into a one-step recursion, and Chapter 5 by differentiating @eq:objective directly, using the factorization of @eq:trajprob to make the unknown dynamics cancel.

Two specific promissory notes come due later. The **stochastic policy** introduced here as a generality becomes a necessity in Chapter 3 and gets its machinery in Chapter 6. The **state-versus-observation** distinction, treated here as bookkeeping, becomes the motivation for sequence models in Chapter 7 and for world models in Chapter 8, where a model that predicts $p(s_{t+1} \mid s_t, a_t)$ — the transition function of @eq:markov, learned rather than given — turns out to be one of the most powerful objects in the field.

## Further reading

The three papers assigned for this week point at the reinforcement-learning half of the chapter, not the control half; they are best read after Chapter 4.

- **H. Mania, A. Guy and B. Recht, "Simple random search provides a competitive approach to reinforcement learning" (2018).** The Augmented Random Search paper. Read it as a corrective: a method with no value function, no policy gradient and almost no machinery matches much more elaborate algorithms on standard continuous-control benchmarks. It is the strongest available argument that benchmark results in this field should be treated with suspicion.
- **A. Irpan, "Deep Reinforcement Learning Doesn't Work Yet" (2018).** A blog post rather than a paper, and the most useful thing on the list to read early. It catalogues the ways the algorithms of Chapters 4 and 5 fail in practice — sample inefficiency, reward hacking, sensitivity to random seeds — and it is honest about the gap between published results and reproducible ones.
- **D. Pathak, P. Agrawal, A. Efros and T. Darrell, "Curiosity-driven Exploration by Self-supervised Prediction" (2017).** The direct answer to this chapter's sparse-reward problem: when the environment gives no useful signal, generate one from the agent's own prediction error, rewarding it for visiting states it cannot yet predict. Also a first look at the idea that a learned dynamics model is useful for more than planning, which Chapter 8 develops at length.

For the control half, the lecture's own sources are the right place to go. **K. Lynch and F. Park, *Modern Robotics* (2017)** is where the joint tables, the configuration-space topologies and the time-scaling functions of this chapter come from, and it is freely available. **J.-C. Latombe, *Robot Motion Planning* (1991)** and **S. LaValle, *Planning Algorithms* (2006)** are the standard treatments of the explicit configuration-space planning that this book's learned policies are trying to replace; reading either makes it much clearer what is being given up.
