# Folklore pools

Done 2026-08-07. This answers the Wayfinder ticket "Folklore pools: candidate traits and traces, with sources". It is the first version of the data the generator eats, and it is deliberately bigger than the game will use, because which values are in play at each stage gets chosen later by the solver rather than by taste.

Seven sources were opened and read directly: Ovid's *Fasti* VI, Reginald Scot, Robert Kirk, Francis Grose, Emily Gerard, the Greek text of Mark 13:35, and three Shakespeare passages. Everything else reached me through reference articles and scholarly summaries that name the owning source, and every one of those is marked. Opening the seven changed several rows and added two, which is recorded where it happened rather than smoothed over.

## How to read the tables

Every row is one candidate value on one axis. The columns are the id, the presentation name, the tradition or region the claim belongs to, one line on what the folklore actually says, and the source.

The trace table carries one extra column, **Status**, because it is the only axis where the pool is assembled rather than transcribed and the difference has to survive into the data. `attested` means the folklore records the sign itself. `inferred` means a real attested custom has been read forwards into a morning sign, which is the game's move and not the source's. `design invention` means there is no folkloric basis and the value is kept for the game's own reasons. Nothing outside the trace table needs this yet; if another axis starts assembling rather than transcribing, it wants the same column.

The **id is the durable part**. It is what the generator, the resolver and the solver touch, and it is what a save file carries. The presentation name is expected to be rewritten, possibly several times, and rewriting it must never move an id. So ids are named after the thing itself and never after the phrasing: `lure-porridge-and-butter` survives the name changing from "Porridge with butter" to "A bowl left on the step", and `hour-cockcrow` survives whatever the interface ends up calling that slot.

Ids carry their axis as a prefix. That is a recommendation rather than something the data forces, and the reason is collision: `salt` is a candidate lure and a candidate aversion in different traditions, and `milk` appears as a lure and soured milk appears as a trace. Axis prefixes make every id globally unique and greppable, which is worth the small repetition in a table.

## What a citation means here

Nearly every claim in a folklore pool reaches you through somebody. The chain matters, so it is marked.

**No mark** means I read the source itself and the quotation is from the text.

**A dagger (†)** means the claim reached me through a secondary write-up, a reference article, or a scholarly summary that names the source, and I did not open the source. Those are still real citations and the named work really does own the claim, but the wording was not checked against the page. Much of this document is still daggered, and pretending otherwise would be the exact failure the ticket is trying to avoid.

Where a source was opened and turned out to say something narrower or different from the summary, the row says so in its own text rather than being quietly adjusted. That happened four times and it is the most useful thing in this document after the pools themselves.

Where a "folk tradition" turns out to be a Victorian revival, a novel, or a film, it is not quietly dropped. It goes in its own section at the bottom, because knowing that the silver bullet is a 1941 screenplay is useful to the design in a way that simply omitting silver is not.

## The shared-value rule

Every value below is holdable by many spirits. Nothing here is a value only one spirit could have, because a value that identifies a spirit outright collapses the deduction, and the year-two idea of writing personal stories about why a given keeper is drawn to a shared lure depends on the lure staying shared.

That rule did real work. Several attractive candidates were rejected for being tied to one creature so tightly that they would name it: the bannik's third firing of the bathhouse only makes sense for a bathhouse spirit, so it became `lure-a-hot-bath` (warmth and water left ready, which anything could want) rather than "the third bath". The same move was made on the knockers' last piece of pasty, which became `lure-the-last-morsel`.

## Lure

What draws a spirit in. Every one of these is something a keeper can physically set out, which is the design's rule that a trait no experiment can test is only noise.

| id | Name | Tradition | What the folklore claims | Source |
|---|---|---|---|---|
| `lure-milk` | A bowl of milk | English, Scots | "Your grandams maides were woont to set a boll of milke before him and his cousine Robin good-fellow, for grinding of malt or mustard, and sweeping the house at midnight." | Scot 1584 |
| `lure-cream` | A saucer of cream | Scottish Lowlands, northern England | Cream and milk left by the hearth are the brownie's standing payment for a night's work. | Briggs 1976 † |
| `lure-porridge-and-butter` | Porridge with butter | Sweden, Norway, Denmark | The tomte or nisse is owed a bowl of Yule porridge with a pat of butter on top, and the best-known tale turns on the butter having sunk out of sight and the nisse taking revenge before he finds it. | Nordic Yule custom † |
| `lure-bread` | A piece of bread | English, German-speaking Europe, Manx | Robin Goodfellow's "messe of white bread and milke, which was his standing fee". The kobold's keep is the same, sweet milk with bread or bread soup. Manx belief adds the condition that the loaf must be made without salt, which is what the fairies will take. | Scot 1584; Grimm, *Deutsche Sagen* 1816-18 †; Manx fairy belief † |
| `lure-ale` | A cup of ale | Norway, Sweden | The farm's founding spirit, buried in a mound on the land, received food and beer at the year's great feasts. This is the older layer under the Yule porridge. | Nordic farm custom † |
| `lure-honey` | Honey | Greek | Odysseus draws the dead up by pouring a libation of honey and milk first. | Homer, *Odyssey* XI † |
| `lure-wine` | A cup of wine | Greek | The same rite, second libation, sweet wine. | Homer, *Odyssey* XI † |
| `lure-barley` | Scattered barley | Greek | Barley meal sprinkled over the libations completes the offering that brings the shades up out of the ground. | Homer, *Odyssey* XI † |
| `lure-blood` | Blood in a bowl | Greek | The shades crowd the trench and only those that drink can speak. Darker than the rest of this pool, and recorded rather than recommended. | Homer, *Odyssey* XI † |
| `lure-banked-fire` | A fire banked, not out | Ireland, Scotland | The hearth fire was smoored at night rather than let die, with a spoken blessing over it. **Corrected on checking**: the motive the Irish and Scottish collections actually record is keeping embers for the morning plus the protection of the blessing, not leaving warmth for the good folk. The fairy motive is a modern gloss and it belongs on the two rows below, which do carry it. | Carmichael, *Carmina Gadelica* 1900 †; Dúchas Schools' Collection † |
| `lure-swept-hearth` | A swept hearth | Ireland | Last thing at night the hearth is swept clean and three cups of spring water are set on it, for the good folk. | Dúchas Schools' Collection † |
| `lure-fresh-water` | Fresh water set out | Ireland, Russia | Clean water left overnight for the good folk to cook with; the bannik is left water and soap, with the thanks said aloud. | Dúchas Schools' Collection †; Ivanits 1989 † |
| `lure-fiddle` | Fiddle music | Norway, Sweden | The fossegrim plays at the waterfall and the mill race, and will teach a player who makes the right offering to play so that the trees dance. | Norwegian and Swedish water-spirit lore † |
| `lure-dancing` | Dancing | Britain, Ireland, Nordic | Fairies gather at night to dance, and the ring they leave is found in the grass the next morning. | European fairy-ring lore † |
| `lure-unfinished-work` | Work left half done | England, Scotland, Germany | The house spirit finishes what was left out: malt or mustard ground, the house swept at midnight, the stable cleaned, and it takes food as its fee. | Scot 1584; Grimm, *Deutsche Sagen* 1816-18 † |
| `lure-flax-on-the-wheel` | Flax left on the wheel | Germany, Austria | Perchta comes through the house during the Twelve Nights to inspect the spinning, and punishes work left unfinished. | Grimm, *Deutsche Mythologie* 1835 † |
| `lure-tobacco` | A pinch of tobacco | Norway, Sweden | Regional offerings to the nisse besides porridge include tobacco and snippets of wool cloth. | Nordic farm custom † |
| `lure-silver-coin` | A silver coin | Britain, Ireland | Silver is left in payment, at the spot where fairy treasure was taken or in exchange for what was given. Note that this is payment rather than attraction, and see the cut list on shiny things. | British fairy lore † |
| `lure-birch-and-soap` | Birch branches and soap | Russia | Fir or birch branches, water and soap are left in the bathhouse, and a formal thank you is said aloud. | Ivanits 1989 † |
| `lure-the-last-morsel` | The last of the food | Cornwall | Miners left the last piece of the pasty underground for the knockers, as their share and their due. | Hunt 1865 †; Bottrell 1870 † |
| `lure-salt` | Salt | Slavic; Scottish Borders, Wales | **Rewritten on checking.** The claim I first had, that spilt salt is thrown into the fire for the brownies to lick, did not survive: in British material salt in the fire is a ward against fairies interfering with the churn, not an offering. What does hold is scattered and genuine: salt was offered to the water sprite of the Tweed for a good catch, "Halgein ydorum", bring salt, is in the fairy speech Gerald of Wales records from the abductee Elidyr, and bread with salt is the Slavic welcome offered to the house spirit as to a guest. Salt is overwhelmingly an aversion and only marginally a lure. | Gerald of Wales, *Itinerarium Kambriae* †; Scottish Borders custom †; Slavic household custom † |
| `lure-a-hot-bath` | A bath left hot | Russia | One firing of the bathhouse belongs to the spirit and no person may take it, and disturbing it gets you scalded or strangled. | Ivanits 1989 † |
| `lure-cider-soaked-toast` | Toast soaked in cider | Somerset, Devon | Wassailing puts cider-soaked toast into the branches of the best apple tree in midwinter, with noise and a health drunk to the tree. | West Country wassail custom † |

Four of these need a keeper control the setup screen does not have yet. `lure-fiddle` and `lure-dancing` are things done rather than things left, `lure-a-hot-bath` needs a room with water in it, and `lure-flax-on-the-wheel` needs the idea of work left out. None of that is a reason to drop them, but they are the rows to check first when the setup screen gets designed, because a lure that cannot be set is exactly the noise the design rules out.

## Aversion

What turns a spirit away. The keeper's side of this is the ward, and a ward and an aversion are only the same thing when the guess is right.

| id | Name | Tradition | What the folklore claims | Source |
|---|---|---|---|---|
| `aversion-iron` | Cold iron | Britain, Ireland | Iron in any form turns the fairies: knives, scissors, nails, a horseshoe over the door. The most consistently reported ward in the whole of British and Irish fairy belief. | Briggs 1976 †; Evans-Wentz 1911 † |
| `aversion-salt-line` | A line of salt | Isle of Man, Cumberland, Cornwall, Europe | The best-evidenced strand is Manx: salt thrown into or set under the churn stops the fairies spoiling the butter, salt goes under the quern, and a pinch goes into any pail of milk carried on a journey. Cumberland sprinkles salt on the fire while churning. Salt is also strewn round a house at a birth and put in a newborn's mouth against abduction. | Manx and Cumbrian fairy belief † |
| `aversion-running-water` | Running water | Scotland | A witch will not follow past the middle of a running stream, which is exactly what saves Tam at the Brig o' Doon. | Burns 1791 † |
| `aversion-rowan` | Rowan | Scotland, Ireland, Nordic | Mountain ash is named the best safeguard of all against witchcraft and devil's magic, and a branch of it is tied to the churn. | Irish and Scottish charm lore † |
| `aversion-whitethorn` | Whitethorn at the window | Roman | Janus gives Cranaë "a thorn, and white it was, wherewith she could repel all doleful harm from doors", and at the end of the rite "a rod of Janus, taken from the white-thorn, was placed where a small window gave light to the chambers". The thorn's stated power is over doors; the rod is what goes in the window. | Ovid, *Fasti* VI.101-168 |
| `aversion-sprinkled-water` | The threshold sprinkled | Roman | "Straightway she thrice touched the doorposts, one after the other, with arbutus leaves; thrice with arbutus leaves she marked the threshold. She sprinkled the entrance with water (and the water was drugged)." Then the raw inwards of a two-month-old sow are offered heart for heart, and those present are forbidden to look back. Note the detail the summaries had lost: leaves rather than branches, doorposts and threshold rather than window frames, and the water is medicated rather than plain. | Ovid, *Fasti* VI.101-168 |
| `aversion-garlic` | Garlic | Romanian, Transylvanian | Among the remedies for an obstinate vampire is to fill the mouth with garlic before reburial. | Gerard 1885 |
| `aversion-spilled-seed` | Spilled seed | Slavic, Greek | Millet, grain or salt scattered on the floor holds the thing all night, because it cannot pass what it has not counted. A Macedonian tale has a hunter pile millet to hold a vampire still while he nails it to the wall. | Abbott 1903 † |
| `aversion-sieve` | A sieve hung up | Greek | A colander left at the door keeps a kallikantzaros counting holes until daylight drives it off, since it cannot count past two. | Greek Twelve Days custom † |
| `aversion-knotted-net` | A knotted net | Slavic | A net hung at the entrance holds the thing counting knots or untying them, which is the same trick as the seed. | Slavic vampire lore † |
| `aversion-name-spoken` | Its name said aloud | German | An alp that came in through a keyhole went back out through it when its name was called in the night. | German Alp lore † |
| `aversion-stopped-keyhole` | The keyhole stopped | German | The mare is mist-like and comes and goes through keyholes and cracks. Stop the hole and it is barred, or shut in. | Grimm, *Deutsche Mythologie* 1835 †; German Alp lore † |
| `aversion-shoes-toed-out` | Shoes set toes to the door | German | Against the nightmare: stop the keyhole, set your shoes with the toes to the door, and get into bed backwards. | German Alp lore † |
| `aversion-holed-stone` | A holed stone | England | "A stone with a hole in it, hung at the bed's head, will prevent the night-mare: it is therefore called a hag-stone, from that disorder, which is occasioned by a hag, or witch, sitting on the stomach of the party afflicted. It also prevents witches riding horses; for which purpose it is often tied to a stable key." The stable half was lost in the summaries and it ties this row to the byre and to the lathered horse. | Grose 1787 |
| `aversion-garment-inside-out` | A garment worn inside out | Devon, Cornwall, Somerset | Turning a coat, hat, glove or pocket inside out breaks a pixy-leading on the spot, and schoolboys went through the woods on nutting days with their coats reversed. | West Country pixy lore † |
| `aversion-concealed-shoe` | A shoe in the wall | England, post-medieval | Worn shoes were deliberately built into houses to catch or turn what came in. Of the recorded finds, about a quarter are at the chimney or hearth and about a fifth under floorboards near a doorway. | Swann 1996 † |
| `aversion-witch-bottle` | A witch bottle | England, early modern | A stoppered bottle of urine, pins and hair buried under the hearth or the threshold, turning a curse back on whoever sent it. | English counter-witchcraft archaeology † |
| `aversion-bread-carried` | Bread carried in the pocket | Ireland, Britain, Isle of Man | A piece of bread in the pocket keeps a traveller from being taken. The Manx material sharpens what is doing the work: fairies will take a loaf made without salt and refuse a salted one, so the ward in the bread is the seasoning. See the crossings section. | Briggs 1976 †; Manx fairy belief † |
| `aversion-laid-clothes` | Clothes laid out for it | England, Scotland, Nordic | Scot's Robin Goodfellow "would chafe exceedingly, if the maid or good-wife of the house, having compassion of his nakednes, laid anie clothes for him, beesides his messe of white bread and milke... What have we here? Hemton hamten, here will I never more tread nor stampen." A 1584 attestation of the gift-of-clothes banishment, a century before the Scottish brownie versions usually cited for it, and shared across Robin Goodfellow, the hob, the brownie and the nisse. | Scot 1584; motif F381.3 † |
| `aversion-log-kept-burning` | A log kept burning | Greek | A thick log, the *christoxylo*, kept alight through the whole of the Twelve Days stops the kallikantzaroi coming down the chimney. This half of the fire crossing held on checking; the Irish half did not. | Greek Twelve Days custom † |
| `aversion-st-johns-wort` | St John's wort | Continental Europe | Gathered at midsummer and hung at doors and windows. Its old name is *fuga daemonum*, the flight of demons. | European midsummer herb lore † |
| `aversion-church-bell` | A bell | Europe, medieval | Church bells were rung to break storms and drive off what rode in them, and many carry inscriptions saying that is what they are for. | Medieval bell inscriptions † |
| `aversion-mirror-after-dark` | A looking glass after sunset | Romanian | It is always considered unlucky to look at oneself in the glass after sunset. | Gerard 1885 |
| `aversion-open-door` | A door left open | Europe | A door or window is opened at a death so that the soul can leave. As a ward this is an exit rather than a barrier, so the design's use of it should be the thing that sends a spirit out of a room, not the thing that stops it coming in. | European death custom † |

## Hour

### Does folklore actually divide the night this way?

Yes, and better than the design assumed, but the boundaries are events rather than clock times, and the modern favourite is the one piece that is not traditional.

The four-part night is genuinely old, and both halves of that were checked against sources rather than summaries. The Roman division is four watches, *vigiliae*, from sunset to sunrise: Lewis and Short give Jerome for the definition, "nox in quattuor vigilias dividitur, quae singulae trium horarum spatio supputantur", the night is divided into four watches, each reckoned at the space of three hours, with Livy, Caesar and Cicero behind it. Polybius describes the rota in the Roman camp, four men drawing lots for which watch each will walk. The four parts are then named in one line of the New Testament, and the Greek is worth having exactly: ἢ ὀψὲ ἢ μεσονύκτιον ἢ ἀλεκτοροφωνίας ἢ πρωΐ (Mark 13:35), "at even, or at midnight, or at the cockcrowing, or in the morning". That is dusk, midnight, cockcrow and first light. It is almost exactly the partition the design already wrote down, arrived at independently, and it has been the standard division of the night in western Europe for two thousand years.

What is not traditional is naming the third watch "three in the morning", though this is the one claim in the section I could not close as hard as I wanted, and asserting a negative deserves saying how far the evidence actually goes. What I can show: the OED's earliest record of "witching hour" is 1762, in Elizabeth Carolina Keene's poem *Nightmare*, and Shakespeare's older "the very witching time of night" points at midnight. Nothing in the pre-modern material I reached names three o'clock, and the boundaries the folklore does name are sunset, midnight, first cockcrow and dawn, all observable events rather than readings off a clock, which is why they survived in places with no clocks. What I could not do is date the first appearance of the three o'clock claim, so "late twentieth century" is the received view rather than something I established. The inversion-of-the-Crucifixion explanation and the Amityville anchor, where the DeFeo murders happened around a quarter past three, are both modern popular material either way. Keep the slot between midnight and cockcrow, because that slot is the third watch and is real. Do not put a clock face on it.

Two things folklore adds that the design did not have.

**Noon is an hour of danger, not a safe one.** Slavic Poludnitsa, Lady Midday, walks the field boundaries at noon and strikes down anyone working through the rest. The Vulgate personifies the same thing in Psalm 91 as the *daemonium meridianum*, and the monastic tradition of the noonday demon runs off the same verse. If the house opening up has to widen the hour axis, this is the honest way to widen it. You cannot slice the night finer than the four watches without inventing, but you can add daylight, and folklore is emphatic that noon is when the other thing walks.

**The eve carries the day.** In Celtic and Hebrew reckoning the day begins at sunset, so the dangerous part of a feast is the evening before it: May Eve, All Hallows' Eve. Irish butter-stealing is worked on May Eve and May morning specifically. This is a different sort of value from the others, since it is about which night rather than which part of a night, and it may fit the season and the house better than the hour axis. Recorded here because it is the strongest hour-adjacent thing in the material and dropping it silently would be the wrong call.

One boundary is worth calling out because it does two jobs at once. Cockcrow is both an hour and a repellent: at the cock's warning "the extravagant and erring spirit hies to his confine", and after it "no spirit dare stir abroad". That is the hour axis and the aversion axis meeting on one value, and it is the cleanest folkloric warrant there is for the candle being both the instrument and the clock.

| id | Name | Tradition | What the folklore claims | Source |
|---|---|---|---|---|
| `hour-gloaming` | Dusk, the gloaming | Scotland, Ireland | The Sith are "of intelligent fluidious Spirits, and light changable Bodies, (lyke those called Astral,) somewhat of the Nature of a condensed Cloud, and best seen in Twilight". | Kirk 1691 |
| `hour-nightfall` | Nightfall | Roman, Judaean | The first of the four watches, ὀψέ, "at even", running from sunset into the early night. | Mark 13:35; Jerome via Lewis and Short † |
| `hour-midnight` | Midnight | across Europe | The second watch, μεσονύκτιον. Robin Goodfellow grinds the malt and sweeps the house at midnight, and Richard wakes at "dead midnight" with the lights burning blue. | Mark 13:35; Scot 1584; Shakespeare, *Richard III* V.iii |
| `hour-small-hours` | The small hours | Roman, Judaean | The third watch, between midnight and the first cockcrow. Real as a slot, and roughly three hours long by Jerome's reckoning. See the note above on why it should not be given a clock time. | Mark 13:35; Jerome via Lewis and Short † |
| `hour-cockcrow` | Cockcrow | across Europe | The third watch takes its name from it, ἀλεκτοροφωνία, and it is the hard boundary: at the cock's warning "the extravagant and erring spirit hies to his confine". | Mark 13:35; Shakespeare, *Hamlet* I.i |
| `hour-first-light` | First light | across Europe | The fourth watch, πρωΐ. Once it has come "no spirit dare stir abroad, the nights are wholesome". The kallikantzaroi have to be back underground before daylight reaches them. | Mark 13:35; Shakespeare, *Hamlet* I.i; Greek Twelve Days custom † |
| `hour-noon` | Noon | Slavic; Christian Europe | Lady Midday walks the field bounds at noon and brings heatstroke, neck pain or madness to anyone working through it. The Vulgate calls the same thing the noonday demon. | Slavic Poludnitsa lore †; Psalm 91:6 (Vulgate) † |
| `hour-the-eve` | The eve | Ireland, Celtic; Judaean | The day begins at sunset, so the evening before a feast carries its power. Butter is stolen on May Eve and May morning, not on May afternoon. | Irish May Eve custom † |

## Haunt

Rooms and parts of a house that carry real folkloric weight. This is the axis where the folklore is richest, because house spirits are attached to places by definition.

| id | Name | Tradition | What the folklore claims | Source |
|---|---|---|---|---|
| `haunt-threshold` | The threshold | Roman; European | Carna "is the goddess of the hinge: by her divine power she opens what is closed, and closes what is open", and the warding rite is worked on the doorposts and the threshold itself. The threshold is also the anthropological type case for a liminal boundary. | Ovid, *Fasti* VI.101-168; van Gennep 1909 † |
| `haunt-hearth` | The hearth | Ireland, Russia, England | Cream is left at the hearth for the brownie, the hearth is swept and water set on it at night, the domovoi lives behind or under the stove, and a quarter of all recorded concealed shoes were built in at the chimney or hearth. | Irish hearth custom †; Ivanits 1989 †; Swann 1996 † |
| `haunt-chimney` | The chimney | Greece, England | The kallikantzaroi come down the chimney during the Twelve Days, which is why a log is kept burning. Shoes were bricked into chimneys for the same reason. | Greek Twelve Days custom †; Swann 1996 † |
| `haunt-cellar` | The cellar | German-speaking Europe, Russia, England | The kobold cleans the cellar as well as the kitchen and stable, the domovoi is reported from the basement, and boggarts keep to dark closed-up spaces. | Grimm, *Deutsche Sagen* 1816-18 †; Ivanits 1989 † |
| `haunt-attic` | The attic | Russia, Nordic | The domovoi's resting places include the attic, and the nisse keeps to the loft as readily as the barn. | Ivanits 1989 †; Nordic farm custom † |
| `haunt-stair` | The stair | Lancashire, Yorkshire | The boggart lives in the cupboard under the stairs, walks through the rooms at night, and raps at the door without ever coming in. Thinner than the other rooms here: the stair is well attested for the boggart specifically and not much beyond it. | Lancashire boggart lore † |
| `haunt-bedchamber` | The bedchamber | German-speaking Europe, England | The mare or alp comes in at the keyhole and sits on the sleeper's chest, or as Grose has it, the hag sits on the stomach of the party afflicted. The counter-charms are all bedroom furniture: the stopped keyhole, the reversed shoes, the hag-stone at the bed's head. | Grose 1787; German Alp lore † |
| `haunt-byre` | The byre | Nordic, Britain | The tomte tends the animals and ties the cows' tails together when slighted, and a horse found lathered with its mane plaited has been hag-ridden in the night. | Nordic farm custom †; English fairy-lock lore † |
| `haunt-washhouse` | The washhouse | Russia, Finland | The bathhouse has its own resident, one firing belongs to it, and no religious images are allowed in there. Steam, water and heat in an outbuilding, which maps onto a scullery or washhouse in an English house. | Ivanits 1989 † |
| `haunt-kitchen` | The kitchen | England, German-speaking Europe | Robin Goodfellow grinds the malt or mustard and sweeps the house; the kobold tidies the kitchen and expects milk and bread for it. | Scot 1584; Grimm, *Deutsche Sagen* 1816-18 † |
| `haunt-dairy` | The dairy | Ireland | Milk and butter are the most attacked things in Irish household belief. The churn gets a horseshoe tied to it, a coffin nail driven into its side, or rowan set at the bottom of the pail. | Irish May Eve custom † |
| `haunt-well` | The well | northern England | The water hags, Peg Powler in the Tees and Jenny Greenteeth in the Lancashire meres, pull people in. They are the standing warning attached to any water on the property. | Henderson 1866 † |
| `haunt-mill` | The mill | Norway, Sweden | The fossegrim belongs to the waterfall and the mill race, which is where you go to hear him and where you leave the offering. | Norwegian and Swedish water-spirit lore † |
| `haunt-under-the-floor` | Under the floor | England, post-medieval | About a fifth of recorded concealed shoes came from under floorboards, alongside witch bottles, animal bones and dried cats. Whatever people were guarding against, they thought it was under there. | Swann 1996 † |
| `haunt-orchard` | The orchard | Somerset, Devon | The best tree in the orchard is wassailed at midwinter with noise, a health, and cider-soaked toast in its branches. See the modern-inventions section on the Apple Tree Man, which is not the same thing. | West Country wassail custom † |
| `haunt-yard` | The yard | Russia | The yard has a spirit of its own, distinct from the one in the house, with its own temper about the animals kept out there. | Slavic dvorovoy lore † |

## Trace

What a spirit leaves behind. The ticket is right that what matters here is being distinguishable at a glance rather than encoding anything, and it is worth saying plainly that this is the axis where the folklore is thinnest as a source of *variety*. Folklore records a great many traces, but it records them as proof that something was there, not as a taxonomy, and nothing in the material sorts traces into a tidy set of kinds. So this pool is assembled rather than transcribed: real attested signs, gathered into a set chosen for being visually distinct from each other.

One thing the folklore does support strongly, and it is the design's own decision: a trace usually tells you what *kind* of thing left it. Knocking in a mine means knockers. Wet marks by the water mean a water hag. A lathered horse with a plaited mane means it was hag-ridden. Trace as an openly visible identifier rather than a hidden fifth axis is what the sources actually look like.

| id | Name | Tradition | Status | What the folklore claims | Source |
|---|---|---|---|---|---|
| `trace-footprints-in-ash` | Footprints in ash | Scotland, European, Jewish | inferred | **Upgraded on checking, and narrower than I had it.** Grose quotes the Reverend Mr Shaw's *History of the Province of Moray*: when a corpse is lifted the straw bed is burnt where no beast can reach it, "and they pretend to find next morning, in the ashes, the print of the foot of the person in the family who shall first die". That is a named, dated attestation of ash taking a supernatural print overnight, but its use is a death omen, not spirit-detection. The strewing-ashes-to-identify-a-demon version is the encyclopedia's claim and stays daggered. | Grose 1787, quoting Shaw; Funk & Wagnalls, *Standard Dictionary of Folklore* † |
| `trace-knocking` | Knocking | Cornwall, England | attested | The knockers hammer in the workings to mark a rich lode or warn of a fall; at Tedworth the house was plagued nightly by drumming for months. | Hunt 1865 †; Bottrell 1870 †; Glanvill 1681 † |
| `trace-scratching` | Scratching | England | attested | Glanvill, visiting Tedworth himself in 1663, reported scratching from under the children's bed. | Glanvill 1681 † |
| `trace-moved-objects` | Objects moved | England | attested | At Tedworth: objects shifted, servants held down in their beds, bedclothes pulled off. | Glanvill 1681 † |
| `trace-doors-found-open` | Doors found open | Europe | inferred | A door or window opened at a death so the soul can go is the same sign read forwards: a door found open in the morning is the mark of a passage. | European death custom † |
| `trace-blue-flame` | A candle burning blue | England | attested | "If, during the time of an apparition, there is a lighted candle in the room, it will burn extremely blue: this is so universally acknowledged, that many eminent philosophers have busied themselves in accounting for it, without once doubting the truth of the fact." Shakespeare has it at "dead midnight" in *Richard III*. This lands directly on the candle, which is already the game's instrument and clock. | Grose 1787; Shakespeare, *Richard III* V.iii |
| `trace-brimstone-smell` | A smell of brimstone | Christian Europe | attested | Sulphur is the devil's calling card from the Middle Ages onward, and it is also the naturalistic explanation people gave for the blue flame, which ties the two traces together. | Medieval and early modern devil lore † |
| `trace-sweet-smell` | A smell of roses | Catholic Europe | attested | The odour of sanctity: a scent of roses or violets with no natural cause, reported at or after the death of a holy person. The warm inverse of brimstone, and worth having in the pool given where the game's ending goes. | Catholic hagiography † |
| `trace-elf-locks` | Plaited manes, tangled hair | England | attested | Queen Mab "plats the manes of horses in the night, and bakes the elflocks in foul sluttish hairs". Called fairy-locks or witches' knots, and taken as proof the animal was ridden. | Shakespeare, *Romeo and Juliet* I.iv |
| `trace-lathered-horse` | A horse found lathered | England | attested | A horse found sweating in its stall in the morning has been hag-ridden through the night. | English fairy-lock lore † |
| `trace-soured-milk` | Milk soured, butter that will not come | England, Ireland | attested | Grose, on witches: "For any slight offence, they prevent butter from coming in the churn, or beer from working." The commonest reported harm in Irish household belief too: the churn works all day and yields nothing, and the cause named is theft by a witch or a fairy. Beer that will not work is the same sign in a different vessel. | Grose 1787; Irish May Eve custom † |
| `trace-uneasy-dog` | A dog that will not settle | England | attested | "Dogs too have the faculty of seeing spirits... but in that case they usually shew signs of terror." An animal's behaviour as the morning's evidence, which costs no art at all. | Grose 1787 |
| `trace-fairy-ring` | A ring in the grass | Britain, Ireland, Nordic | attested | A ring of mushrooms or of darker, taller grass, found in the morning, is where they danced in the night. The darker ring is a real and highly visible thing, which is useful when the trace has to read at a glance. | European fairy-ring lore † |
| `trace-wet-marks` | Wet marks | Russia | attested | The bathhouse spirit leaves the room used, the water gone and the birch leaves scattered. **Narrowed on checking**: this row used to claim English water hags leave the water on them, cited to Henderson. Henderson does not say it. His Peg Powler and Jenny Greenteeth are drowners, and the only residue in the entry is froth on the river, "Peg Powler's suds". The Russian half is the whole of the attestation. | Ivanits 1989 † |
| `trace-emptied-bowl` | The bowl taken | Nordic, Britain | attested | The offering gone is the proof it came, and the offering left untouched is the proof it did not, or that it was offended. Both readings are attested and both are information. | Scot 1584; Nordic Yule custom † |
| `trace-work-done` | Work found finished | England, Germany | attested | The malt or mustard ground, the house swept at midnight, the stable cleaned, all of it done in the night and none of it asked for. | Scot 1584; Grimm, *Deutsche Sagen* 1816-18 † |
| `trace-scattered-seed` | Seed scattered and heaped | Slavic, Greek | inferred | Where a counting-charm was laid, the morning shows the seed disturbed and gathered rather than merely stepped through. | Abbott 1903 † |
| `trace-untied-knots` | Knots undone | Slavic | attested | A knotted net left at the entrance is found untied, knot by knot. | Slavic vampire lore † |
| `trace-dead-fire` | The fire out | Ireland | inferred | A fire deliberately smoored to last the night, found dead in the morning, is a legible state in a tradition where leaving no fire is itself the offence. | Irish hearth custom † |
| `trace-frost` | Frost on the glass | none | design invention | **No folkloric basis found.** Jack Frost as a personified frost-maker is a nineteenth-century literary figure, and frost as a sign left by a spirit is not attested in the sources consulted. It is kept because the game has its own strong reason for it, cold being the entire economy, and because the ticket's bar for a trace is that it reads at a glance. It should be labelled a design invention in the data rather than dressed as folklore. | design invention |
| `trace-damp` | Damp and mould | partly | design invention | Wet marks left by water spirits are attested; damp and mould spreading through a room as a sign of a presence is not, and belongs with frost as a design invention that the fiction earns on its own. | partly design invention |

## Where the folklore does not support what the design assumed

**"Something shiny" is not a lure.** The design's example list has it, and it did not survive the search. What is attested is silver as *payment*: a coin left in exchange, a coin left at the spot where fairy money was found. What is also attested is the witch ball, a glass sphere hung in a window to catch a spirit in its strands, but that is an eighteenth and nineteenth century English decorative object and it is a trap rather than a lure. Nothing turned up saying spirits are drawn to bright things as such. That idea is mostly tabletop and video game convention, borrowed from the (itself unfounded) belief about magpies. `lure-silver-coin` is in the pool on the payment reading, and if the presentation wants the shine, that is a presentation choice made knowingly.

**"An open door" is an exit, not a barrier.** The design lists it among aversions. What the sources have is a door or window opened at a death so the soul can leave, which is the opposite mechanism: the door does not stop the thing coming in, it lets it out. That is still a perfectly good ward mechanically, and it is a better one, because "put this down and it goes" is exactly what an aversion does in this game. It just wants writing that way rather than as a barrier.

**The night cannot be sliced finer than four.** The four watches are the tradition and there is no fifth. If the hour axis has to widen when the house opens up, the folkloric moves available are to add noon and to add the eve, both of which take the axis out of the night. That is a real constraint on the "each opening widens exactly one axis" plan, and it means hour is probably not the axis to widen twice.

**Values cross axes, and that is a feature, but it is weaker than I first wrote it.** This was the finding being read as cover for the ward-versus-aversion mechanic, so both sides of each crossing got checked, and two of the four moved.

**Salt fails as a crossing in the direction I claimed.** I had spilt salt thrown into the fire for the brownies to lick. In the British material salt in the fire is a ward, thrown while churning to stop the fairies interfering, not an offering. The row was rewritten. Salt does still cross, on completely different evidence: salt offered to the water sprite of the Tweed for a good catch, "Halgein ydorum" in the fairy speech Gerald of Wales records, and bread with salt as the Slavic welcome to the house spirit. So the crossing is real but lopsided, one strong axis and a handful of counter-cases, rather than the even split I had.

**Bread crosses, and the Manx material says exactly why.** Fairies will take a loaf and refuse a salted one. So bread is the lure and the salt in it is the ward, in the same object, which is a sharper version of the point than "bread is both".

**Fire fails as a crossing.** The Greek half holds: the christoxylo is kept burning through the Twelve Days against the kallikantzaroi at the chimney. The Irish half does not. What the Irish and Scottish collections record about the smoored fire is keeping embers for the morning under a spoken blessing, not warmth left for the good folk. The fairy motive in the Irish house attaches to the swept hearth and the water set out, both of which are separately in the pool. The row was corrected.

**Milk crosses lure to trace rather than lure to aversion**, which is not the same claim and does not do the same work: milk set out is a lure and milk soured is a trace, and nothing there is ambiguous.

What survives is still worth having. In the data an id sits on exactly one axis, so each crossing got assigned by which reading is stronger and the alternate is noted in the row. Bread and salt genuinely are the same offering read two ways depending on how it is prepared, and that is real cover for a mechanic built on a ward only being an aversion when the guess is right. It is one good example rather than a pattern, and the design should lean on it as such.

**Trace is not a folkloric category.** Everything else here transcribes. Trace assembles. The sources are full of signs left behind, but they are attached to particular creatures and particular incidents and nobody sorted them into kinds. So the trace pool was chosen for visual distinctness first and sourced second, which is the right way round given what the trace axis is for, but it does mean this pool is less "research and transcription" than the other four.

## Modern inventions, kept out of the pools

Recorded rather than dropped, because knowing where a thing came from is worth having, and because several of these are the first ideas anyone reaches for.

**Silver kills it.** Not folklore. The rule that a werewolf can only be killed with silver comes from Curt Siodmak's screenplay for *The Wolf Man* (1941). The often-repeated claim that the Beast of Gévaudan was shot with a silver bullet in 1767 comes from a 1946 novel, five years after the film. Germanic belief did hold that a witch shot with silver would take a wound that would not heal, so silver is not wholly untraditional, but the monster-killing rule is a screenplay.

**No reflection in the mirror.** Bram Stoker's, in *Dracula* (1897). No vampire of folklore has trouble with a looking glass. What is traditional is that mirrors catch souls and are therefore covered at a death, which is the entry kept above.

**Three in the morning.** See the hour section. The four-part night is genuine and ancient, attested from Jerome through to the Greek of Mark 13:35; the clock time and the inversion-of-the-Crucifixion explanation are modern. This is the one entry in this section I hold more loosely than the others, because it is a negative and I could establish that nothing early names three o'clock without being able to date when something first did.

**Cold spots.** A twentieth-century ghost-hunting instrument reading, arriving with thermometers and the professionalisation of psychical research. Not a traditional sign. Worth knowing precisely because the game's economy is temperature, and the temptation to reach for it will be strong.

**A circle of salt you stand inside.** Salt at the threshold and in the corners is folk custom. The complete protective circle is grimoire ceremonial magic and then modern fiction, and it is not what a farmhouse did.

**It cannot enter unless invited.** Stoker again, and the films after him.

**Jack Frost.** A nineteenth-century literary personification, not an inherited folk figure. See `trace-frost`.

**The Apple Tree Man.** The only source for him is Ruth Tongue, whose Somerset collecting is seriously questioned: vague to evasive about provenance, written down decades after the fact, sometimes prompted by books she had read. She is the first person ever to mention him. Wassailing is solidly attested and is what `haunt-orchard` and `lure-cider-soaked-toast` rest on. The Apple Tree Man himself is not in the pools.

## Tempted, and cut for want of a source

- **A broom laid across the doorway**, with the straws to be counted. It fits the counting complex perfectly and it is repeated everywhere, and I could not find it in anything that owns the claim rather than repeating it. If the counting complex is wanted, `aversion-spilled-seed`, `aversion-sieve` and `aversion-knotted-net` are all properly attested.
- **The thirteenth stair.** Nothing. Modern haunted-house writing.
- **English water hags leaving wet marks behind them.** Cut on checking. Henderson's Peg Powler and Jenny Greenteeth pull people into the water and drown them, and the only residue named is froth on the river itself. Nothing in the entry has them leaving water anywhere a keeper would find it in the morning. `trace-wet-marks` now rests on the Russian bathhouse alone.
- **A mirror, in either direction.** The vampire trope is Stoker and is out. The covered mirror was in the aversion pool and has been cut from it too: mirrors are covered at a death so the soul is not caught in the glass, which is a mirror being dangerous *to* the dead rather than a mirror turning anything away, so it fails the definition the axis opens with. The custom is real and well attested (`European death custom †`), so it is a candidate for a ward, a haunt or a trace if any of those wants it. It is not an aversion.
- **Elder planted by the door.** There is real material here, the Danish Hyldemoer and the requirement to ask the elder's permission before cutting it, but what I could reach was about the tree's own resident rather than about elder warding anything off a house, and I did not want to bend it.
- **A spirit that cannot cross a line of ash.** Ash catches footprints, which is `trace-footprints-in-ash`. Ash as a barrier appears to be a back-formation from that, and I found nothing behind it.
- **Iron nails specifically against a noisy spirit.** Iron against fairies generally is solid and is in the pool. The narrowing to poltergeists is modern.

## Sources

Grouped by what the chain to me actually was.

**Read directly.**

- Ovid, *Fasti* VI.101-168, the Kalends of June. Carna the goddess of the hinge, "by her divine power she opens what is closed, and closes what is open"; the whitethorn Janus gives her; the striges that come for the five-day-old Proca; the arbutus leaves, the drugged water, the two-month-old sow, and the whitethorn rod at the window. Frazer's Loeb translation via Theoi, <https://www.theoi.com/Text/OvidFasti6.html>. One caveat that only shows in the text: Frazer's own note says the name is probably from *caro, carnis*, flesh, and that Ovid has confounded Carna with Cardea the goddess of hinges. The hinge identification is Ovid's, possibly his own conflation, so the Roman threshold rows rest on a poet rather than on cult practice.
- Reginald Scot, *The Discoverie of Witchcraft* (1584), the chapter confuting Incubus. The bowl of milk, the white bread and milk standing fee, the grinding of malt or mustard, the sweeping of the house at midnight, and the clothes that drive the spirit off for good. Project Gutenberg, <https://www.gutenberg.org/files/60766/60766-h/60766-h.htm>. The same chapter carries a long list of household bogey names (urchins, elves, hags, fairies, kit with the candlestick, the spoorne, the mare, the man in the oak, the hell wain, the puckle, hobgoblin, Tom tumbler, boneless) which is a ready-made vocabulary for presentation names if that is ever wanted.
- Robert Kirk, *The Secret Commonwealth of Elves, Fauns and Fairies* (1691). "Light changable Bodies, (lyke those called Astral,) somewhat of the Nature of a condensed Cloud, and best seen in Twilight."
- Francis Grose, *A Provincial Glossary, with a Collection of Local Proverbs and Popular Superstitions* (1787), the Popular Superstitions section. The hag-stone at the bed's head and on the stable key; the candle burning extremely blue during an apparition; dogs showing terror at spirits; witches preventing butter coming in the churn or beer from working; and Shaw's Moray account of the footprint found in the ashes. Internet Archive, <https://archive.org/details/provincialglossa00gros>.
- Shakespeare, *Hamlet* I.i; *Richard III* V.iii; *Romeo and Juliet* I.iv. Via the MIT Shakespeare texts, <https://shakespeare.mit.edu/>.
- Emily Gerard, "Transylvanian Superstitions" (*The Nineteenth Century*, 1885). Project Gutenberg, <https://www.gutenberg.org/files/52165/52165-h/52165-h.htm>. The source Stoker used, and the first appearance of "nosferatu" in English.
- Mark 13:35 in Greek, ἢ ὀψὲ ἢ μεσονύκτιον ἢ ἀλεκτοροφωνίας ἢ πρωΐ, across the Nestle, Westcott and Hort, Byzantine and Tischendorf texts. The four-part night named in one line.

**Named sources whose claims reached me through reference articles and scholarly summaries rather than the text itself.** Each is the work that owns the claim; the dagger in the tables marks that I did not open it.

- Joseph Glanvill, *Saducismus Triumphatus* (1681). The Drummer of Tedworth, 1662-3, including Glanvill's own visit in 1663.
- Robert Burns, *Tam o' Shanter* (1791). Witches cannot follow past the middle of a running stream.
- Jacob and Wilhelm Grimm, *Deutsche Sagen* (1816-18). German house spirits, the kobold's keep of milk and bread.
- Jacob Grimm, *Deutsche Mythologie* (1835). The mare, and the systematic Germanic material behind it.
- Robert Hunt, *Popular Romances of the West of England* (1865), and William Bottrell, *Traditions and Hearthside Stories of West Cornwall* (1870). The knockers.
- G. F. Abbott, *Macedonian Folklore* (1903). The vampire held still by a pile of millet.
- Arnold van Gennep, *Les rites de passage* (1909). The threshold as the type case of a liminal boundary.
- William Henderson, *Notes on the Folk-Lore of the Northern Counties of England and the Borders* (1866), chapter VII, "Local Sprites", the Peg Powler entry. Peg Powler of the Tees and the Lancashire Jenny Greenteeth, both drowners. This entry supports `haunt-well` and nothing else; it says nothing about wet marks left behind.
- W. Y. Evans-Wentz, *The Fairy-Faith in Celtic Countries* (1911). Iron and the fairy faith.
- Stith Thompson, *Motif-Index of Folk-Literature* (1932-36, rev. 1955-58), and the ATU tale-type index. The standard indexes; F381.3, laying a brownie by a gift of clothes, is the motif behind the brownie material.
- *Funk & Wagnalls Standard Dictionary of Folklore, Mythology and Legend* (1949-50). Strewing ashes to take the prints of what comes.
- Katharine Briggs, *A Dictionary of Fairies* (1976, US title *An Encyclopedia of Fairies*). The single most-cited work behind the British and Irish rows here.
- Linda Ivanits, *Russian Folk Belief* (1989). The domovoi, the bannik, the dvorovoy.
- June Swann, "Shoes Concealed in Buildings" and the Northampton Museum Index of Concealed Shoes (from the 1960s; the figures quoted are from her 1996 article). Roughly 26% at chimney or hearth, 23% under floorboards, 19% behind walls, 19% from the roof.
- Homer, *Odyssey* XI. The libations of honey and milk, sweet wine and water, the barley meal, and the shades that must drink before they can speak.
- Jerome, quoted in Lewis and Short under *vigilia*: "nox in quattuor vigilias dividitur, quae singulae trium horarum spatio supputantur", with Livy, Caesar and Cicero behind the four-watch reckoning. Polybius, *Histories* VI.35 describes the four-man rota that walks them in the Roman camp.
- The *Oxford English Dictionary* under "witching hour": earliest record 1762, Elizabeth Carolina Keene, *Nightmare*.
- Psalm 91:6, and the Vulgate's *daemonium meridianum*. The noonday demon.

- Alexander Carmichael, *Carmina Gadelica* (1900), for the smooring of the fire and its blessing, and the Dúchas Schools' Collection at the National Folklore Collection of Ireland for the Irish hearth customs. These two replaced a vaguer "Irish hearth custom" once the fire row turned out to need correcting, and they are the sort of national archive citation the rest of this document could use more of.
- Gerald of Wales, *Itinerarium Kambriae* (1191), for the Elidyr account and the fairy words including "Halgein ydorum", bring salt.

**Traditions cited without a single owning work**, because the claim is general across a body of collected material rather than belonging to one collector: Nordic Yule and farm custom, the Greek Twelve Days customs around the kallikantzaroi, Manx and Cumbrian fairy belief, West Country pixy and wassail lore, Lancashire boggart lore, Slavic vampire and Poludnitsa lore, Norwegian and Swedish water-spirit lore, European death custom, medieval bell inscriptions, English counter-witchcraft archaeology, and Catholic hagiography on the odour of sanctity.

**What is still daggered, and whether it bothers me.** Most of the aversion pool, most of the haunt pool, and most of the trace pool. It bothers me in exactly three places. The Manx salt and bread material is now doing real argumentative work in the crossings section and it rests on one folklorist's blog summarising Manx collections rather than on the collections; that should be traced to the *Folk-Lore Journal* and the Manx sources before the crossing is quoted back at anyone. Briggs 1976 stands behind more rows than any other single work and was never opened. And the Homeric libation rows would take five minutes to close against a translation and I did not spend them. Everything else that is daggered is the sort of claim that appears in every reference work about it, and the risk there is wording rather than fact.

## What this leaves open

The pools are wider than the game needs, which was the point. What they cannot say is how many values per axis belong at each stage of the house opening up, because that is the solver's job and not folklore's.

One thing here still wants a decision before the generator is written: whether the hour axis is allowed to leave the night, which decides whether `hour-noon` and `hour-the-eve` are real candidates or notes.

A second question is now half answered. The trace table carries a Status column, so `attested`, `inferred` and `design invention` survive into the data rather than living only in prose. What that column does *not* decide is whether the generator may draw a non-attested value at all. Two of twenty-one traces are design inventions and three more are inferred, and both `trace-frost` and `trace-damp` were kept deliberately because cold is the game's entire economy. Excluding them is a design call about how much the folklore grounding is worth, not a documentation fix, so it belongs to whichever ticket settles the trace pool.
