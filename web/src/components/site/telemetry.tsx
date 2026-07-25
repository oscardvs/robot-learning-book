import status from '@/data/status.json';

// Every number here is measured by the sync script from the repo itself. The site
// says what is actually finished, including the parts that are not.

const fmt = new Intl.NumberFormat('en-US');

export function TelemetryRail({ className = '' }: { className?: string }) {
  const items = [
    { label: 'chapters', value: `${status.chaptersWritten} / ${status.lectureCount}` },
    { label: 'slides recovered', value: fmt.format(status.slideCount) },
    { label: 'transcript', value: `${fmt.format(Math.round(status.transcriptWords / 1000))}k words` },
    { label: 'synced', value: status.generatedAt },
  ];

  return (
    <dl
      className={`flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-line py-3 ${className}`}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2.5">
          <dt className="u-label">{item.label}</dt>
          <dd className="u-readout text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
