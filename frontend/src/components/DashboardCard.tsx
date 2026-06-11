type DashboardCardProps = {
  title: string;
  value: number | string;
};

export default function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl border p-6 shadow-sm">
      <h2 className="text-gray-500 text-sm">
        {title}
      </h2>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
