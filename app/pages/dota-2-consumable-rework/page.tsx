import Callout from "@/components/callouts/callout";
import Card from "@/components/cards/card";

export default function Dota2ConsumableRework() {
  return (
    <div className="flex flex-col gap-lg">
        <div className={"flex flex-row gap-lg"}>
            <div>
                <label>DESIGN STUDY</label>
                <h1 className={"text-hero"}>Dota 2 Consumable Items Rework</h1>
                <p>A proposed conversion of some consumable items into a shared team ability similar to the already present Glyph and Scan.</p>

            </div>
            <img className={"object-contain max-w-lg"} src={"/portfolio/dota2/dota2-logo.webp"} alt={"Dota 2 Logo"}/>
        </div>

        <Callout variant={"warning"}>This is a design rework proposition for a game by another developer made as a portfolio and study piece, and is in no way officially associated with said game&#39;s developer.</Callout>
        <Callout variant={"caution"}>This design document is non-exhaustive and does not contemplate all repercussions of its integration into the game. In the event of an actual adoption of these designs, further balance changes and tweaks not listed within might be necessary.</Callout>
        <Callout variant={"caution"}>This design proposition is based on the game as it existed when this was written. Due to patch changes throughout the years, information in this document may no longer be correct or the redesign may no longer be relevant.</Callout>

        <div className="flex flex-row gap-lg">
            <div>
                <div>
                    <h2>Overview</h2>
                    <ul>
                        <li>Wards and Smoke of Deceit no longer exist as inventory items and are removed from the shop.</li>
                        <li>Three new Team Abilities are added, Summon Observer Ward, Summon Sentry Ward, and Smoke of Deceit, which once cast function the same as the items currently do.</li>
                        <li>These abilities may be used by any member of a team, and have a shared cooldown and charges.</li>
                    </ul>
                </div>

                <div className={"flex flex-col gap-md"}>
                    <h2>What are the issues with the current system?</h2>
                    <p>The way the system currently operates makes it difficult to keep track of, with players having to be aware of current shop stock and restock time (hidden behind opening the actual shop menu rather than being available in the base HUD), allied hero and courier inventories, and wards already placed on the map.</p>
                    <p>Due to these consumables being inventory items and their maintained importance throughout the entire game, having to juggle inventory slots, backpack slots, and courier slots, and having to switch between observer and sentry wards (as they&#39;ve been concatenated into a single slot exactly because of this issue) becomes an overly cumbersome task unrelated to the game&#39;s enjoyable aspects.</p>
                    <p>Given the item&#39;s gold cost and the aforementioned inventory slot premium, the responsibility of using these items has historically been assigned to a few &#34;sacrificial&#34; team members (the Supports), however the player in the best position at a given time to use one of these items is often not the one carrying one.</p>
                </div>
            </div>

            <div className="flex flex-col gap-md border rounded border-primary-400 p-lg">
                <h3>What is a &#34;Team Ability&#34;?</h3>
                <p>A team ability is an ability which is available to and may be activated by any member of a team, sharing its charges and cooldown amongst them.</p>
                <p>Although not formally named in the live game, this framework is already being used by two other abilities:</p>
                <ul>
                    <li>Glyph of Fortification</li>
                    <li>Scan</li>
                </ul>
            </div>
        </div>

        <div>
            <h2>What does this design accomplish?</h2>
            <p>This design decouples Wards and the Smoke of Deceit from the inventory and the shop, easing inventory management and the tracking of their availability. With Team Abilities being usable from anywhere and by anyone, it also incentivizes the participation of all team members in vision control, rather than of only a couple, spreading the burden away from the historically gold-starved Support roles. All of this is gracefully accomplished through reinforcing a system already present in the game.</p>
        </div>

        <div>
            <h2>Abilities</h2>
            <div className="flex flex-row gap-lg">
                <Card iconSrc={"/portfolio/dota2/observer_ward_icon.webp"} title={"Summon Observer Ward"} alt={"Observer Ward Icon"}>
                    <p>Plants an Observer Ward, an invisible watcher that gives ground vision in a 1600 radius to your team.</p>
                    <ul>
                        <li>Duration: 360 Seconds</li>
                        <li>Initial Charges: 2</li>
                        <li>Maximum Charges: 4</li>
                        <li>Charge Replenish Time: 135 Seconds</li>
                    </ul>
                </Card>
                <Card iconSrc={"/portfolio/dota2/sentry_ward_icon.webp"} title={"Summon Sentry Ward"} alt={"Sentry Ward Icon"}>
                    <p>Plants a Sentry Ward, an invisible watcher that grants True Sight, the ability to see invisible enemy units and wards, to any existing allied vision within a radius.</p>
                    <ul>
                        <li>Duration: 420 Seconds</li>
                        <li>Initial Charges: 3</li>
                        <li>Maximum Charges: 8</li>
                        <li>Charge Replenish Time: 80 Seconds</li>
                    </ul>
                </Card>
                <Card iconSrc={"/portfolio/dota2/smoke_of_deceit_icon.webp"} title={"Smoke of Deceit"} alt={"Smoke of Deceit Icon"}>
                    <p>Turns the caster and all allied player-controlled units in a 1200 radius invisible, and grants 15% bonus movement speed for 45 seconds.</p>
                    <p>While the caster is still disguised, any allies that come within 15% range of them will also get the buff applied to them. Each smoke can only be applied once to allies.</p>
                    <p>Attacking, or moving within 1025 range of an enemy hero or twoer, will break the invisibility.</p>
                    <p>Disguise grants invisibility that is immune to True Sight.</p>
                    <ul>
                        <li>Duration: 45 Seconds</li>
                        <li>Initial Charges: 2</li>
                        <li>Maximum Charges: 3</li>
                        <li>Charge Replenish Time: 420 Seconds</li>
                    </ul>
                </Card>
            </div>
        </div>
    </div>
  );
}