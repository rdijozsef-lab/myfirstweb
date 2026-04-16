import Image from "next/image";

type PresetCardProps = {
  name: string;
  note: string;
  image: string;
};

export function PresetCard({ name, note, image }: PresetCardProps) {
  return (
    <article className="group overflow-hidden rounded-[26px] border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image src={image} alt={name} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="space-y-3 p-6">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm leading-6">{note}</p>
      </div>
    </article>
  );
}
