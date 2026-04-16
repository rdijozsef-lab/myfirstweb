type SectionTitleProps = {
  eyebrow: string;
  title: string;
  text: string;
  align?: "left" | "center";
};

export function SectionTitle({ eyebrow, title, text, align = "left" }: SectionTitleProps) {
  return (
    <div className={`max-w-3xl space-y-4 ${align === "center" ? "mx-auto text-center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="text-base leading-7 sm:text-lg">{text}</p>
    </div>
  );
}
