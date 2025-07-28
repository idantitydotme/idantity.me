import Image from "next/image";

export default function Home() {
  return (
      <div className="flex flex-col gap-lg">
        <div className={"flex flex-row gap-lg"}>
          <div>
            <label>CODE</label>
            <h1 className={"text-hero"}>Rimelight Game Framework</h1>
            <p>An all-encompassing game development framework Unreal Engine plugin for live service titles.</p>
          </div>
          <img className={"object-contain max-w-lg"} src={"/portfolio/coming-soon.webp"} alt={"Coming Soon"}/>
        </div>
      </div>
  );
}
