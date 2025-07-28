import Callout from "@/components/callouts/callout";

export default function Home() {
  return (
      <div className="flex flex-col gap-lg">
        <div className={"flex flex-row gap-lg"}>
          <div>
            <label>DESIGN STUDY</label>
            <h1 className={"text-hero"}>RuneScape Aura System & Loyalty Points Rework</h1>
            <p>A proposed removal of the Loyalty Programme and integration of the Aura system into the Prayer skill.</p>

          </div>
          <img className={"object-contain max-w-lg"} src={"/portfolio/runescape/runescape-logo.webp"} alt={"RuneScape Logo"}/>
        </div>

        <Callout variant={"warning"}>This is a design rework proposition for a game by another developer made as a portfolio and study piece, and is in no way officially associated with said game&#39;s developer.</Callout>
        <Callout variant={"caution"}>This design document is non-exhaustive and does not contemplate all repercussions of its integration into the game. In the event of an actual adoption of these designs, further balance changes and tweaks not listed within might be necessary.</Callout>
        <Callout variant={"caution"}>This design proposition is based on the game as it existed when this was written. Due to patch changes throughout the years, information in this document may no longer be correct or the redesign may no longer be relevant.</Callout>

        <div className={"flex flex-col gap-md"}>
          <div className={"flex flex-row gap-lg"}>
            <img className={"object-contain"} src={"/portfolio/runescape/runescape-aura.webp"} alt={"RuneScape Aura"}/>
            <div>
              <h2>Overview</h2>
              <ul>
                <li>Auras are replaced with Blessings as part of the Prayer Skill.</li>
                <li>A new resource is added representing the player&#39;s good standing with the gods, Favour, which is consumed by activating Blessings.</li>
                <li>Auras are decoupled from the Members Loyalty Programme, facilitating the system&#39;s removal.</li>
                <li>Additionally, this rework could be used as a hook to raise the skill to the maximum level of 120.</li>
              </ul>
            </div>
          </div>

          <div className={"flex flex-col gap-md"}>
            <h2>What are the issues with the current system?</h2>
            <p>There are four key points which have been recognized as issue factors:</p>
            <ul>
              <li>Auras are tied to the Members Loyalty Programme, a system exterior to gameplay which the developer has shown signs of moving towards deprecation.</li>
              <li>The system has no ties to gameplay or narrative, breaking the player&#39;s immersion.</li>
              <li>The unlock process for Auras is completely time-gated, with no way of accelerating it through gameplay.</li>
              <li>The cooldown system breaks the flow of gameplay with artificial downtime, forcing players to juggle cooldowns.</li>
            </ul>
            <p>Given their importance for optimal performance in various pieces of content (to the point of combat content even being balanced around their use) these limitations are frustrating to players, and barely any new Auras have been added across multiple years since the content&#39;s release, likely due to the developer recognizing these flaws.</p>
          </div>
        </div>

        <div>
          <h2>What does this design accomplish?</h2>
          <ul>
            <li>Decouples Auras from the Members Loyalty Programme, <b>facilitating its deprecation.</b></li>
            <li>Breathes life into a skill with only one update in the last <b>five years</b> and facilitates adding <b>new content</b> to it.</li>
            <li>Provides incentives to interact with the skill <b>post level cap</b>, and increases sinks to an item group <b>devalued over the years.</b></li>
            <li>Substitutes Aura cooldowns and downtime with a <b>resource based system</b>.</li>
            <li>Thematically integrates Auras into one of <b>RuneScape&#39;s core themes</b>.</li>
          </ul>
        </div>

        <div>
          <h2>Design Description</h2>
          <div className={"flex flex-col gap-md"}>
            <h3>Blessings</h3>
            <ul>
              <li>Blessings are temporary <b>passive effects</b> much like Auras.</li>
              <li>Blessings are accessed through the <b>Prayer Abilities</b> interface, as a tab alongisde Prayers & Curses.</li>
              <li>Blessings are activated through consumption of a new resource, <b>Favour</b>.</li>
              <li>A Blessing has both an <b>Activation Cost</b>, a large upfront spending for turning on a Blessing, and an <b>Upkeep Cost</b>, a smaller spending taken every minute while the Blessing is active.</li>
              <li>Higher level or more useful Blessings have <b>higher</b> Activation and Upkeep costs.</li>
              <li>Much like Auras, <b>only one</b> blessing may be active at a time.</li>
            </ul>
            <p>Blessings remain active while lobbied/logged off, but don&#39;t tick upkeep (which means you don&#39;t have to repay the activation cost if you hop worlds or log out). Switching blessings mid-way through content is possible but more costly, as you pay the activation cost on every switch.</p>
          </div>
          <div>
            <div className={"flex flex-row gap-lg"}>
              <img className={"object-contain"} src={"/portfolio/runescape/runescape-prayer.webp"} alt={"RuneScape Prayer"}/>
              <div>
                <h3>Favour</h3>
                <ul>
                  <li>Favour is a new resource stored in the Currency Pouch.</li>
                  <li>Favour is obtained through training Prayer in various amounts according to the method and materials used.</li>
                </ul>
                <p>This gives an incentive to keep engaging with the skill and provides a method to constantly sink bones and ashes.</p>
                <p>This pattern is already present in skills such as Herblore, in which players train intensively for a period to stock on potions, and consume them slowly during other content.</p>
                <p>As long as a player has enough Favour they can keep a Blessing on indefinitely, eliminating the need to juggle between different Auras in a long session.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2>Next Steps</h2>
          <p>With the migration of Auras into this new system and the existence of Solomon&#39;s General Store the Loyalty Programme loses relevancy, and my suggestion would be to use the opportunity of this rework to phase out the system entirely.</p>
          <ul>
            <li>Players are <b>refunded</b> Loyalty Points equal to the cost of all Auras they currently own, and purchase of new Auras is <b>disabled</b>.</li>
            <li>Auras are formally removed from the Loyalty Programme Shop as the rework is released.</li>
            <li>To avoid being locked out of the system entirely on launch (due to not having any Favour stocked up) players will be granted Favour equal to a <b>multiple of their Prayer Level</b>.</li>
            <li>The Members Loyalty Programme may then either be changed to a monthly grant of Oddments or removed entirely, with the shop&#39;s remaining content being integrated into the Marketplace, and remaining Loyalty Points converted into Oddments.</li>
          </ul>
          <h3>Future Content</h3>
          <p>New Blessings may be added and unlocked through Codices, like how it&#39;s already been done with Prayers. This rework could additionally act as an opportunity to raise the maximum level of the Prayer skill to 120, something the developer has slowly been doing to multiple skills in the game. The exact details of this update are not contemplated within this design, but would imply a redistribution of Prayers and Blessings to more adequately cover the larger level spectrum.</p>
        </div>
      </div>
  );
}