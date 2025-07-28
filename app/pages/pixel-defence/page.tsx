import Image from "next/image";

export default function Home() {
  return (
      <div className="flex flex-col gap-lg">
        <div className={"flex flex-row gap-lg"}>
          <div>
            <label>GAME</label>
            <h1 className={"text-hero"}>Pixel Defence</h1>
            <p>A tower defence in which your currency is also your tower&#39;s ammunition.</p>
          </div>
          <img className={"object-contain max-w-lg"} src={"/portfolio/coming-soon.webp"} alt={"Coming Soon"}/>
        </div>
      </div>
  );
}
