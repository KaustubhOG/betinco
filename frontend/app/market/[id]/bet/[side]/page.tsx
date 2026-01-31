import BetBox from "@/app/components/BetBox";

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h2>Market #{id}</h2>
      <p>Market question goes here</p>

      <BetBox />
    </main>
  );
}
