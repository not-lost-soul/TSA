import { formatINR } from "@/lib/types";
export default function Price({
  amount,
}: {
  amount: number | null | undefined;
}) {
  if (amount == null)
    return <span className="price-empty">Fee to be announced</span>;
  return (
    <>
      {formatINR(amount)}
      <small className="gst-note">Fees inclusive of GST</small>
    </>
  );
}
