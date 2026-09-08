/* ============================================================
   OPALÉRA — shared catalogue & helpers
   Used by product.html and payment.html (jewellery_Html.html keeps
   its own inline copy of the price data for the grid & studio).
   Every piece carries its own hand-written description.
   ============================================================ */
const OPALERA = (() => {

  /* Product photography hotlinks directly to Pexels (a free-to-use stock
     photo library) at 1200px — sharp at every size it's shown at. CDN is
     kept only for backwards compatibility with older callers. */
  const CDN = "https://images.pexels.com/photos/";

  /* id, category, name, price (R), image, unique description */
  const P = [
  [1,"necklace","Sapphire Necklace",1759,"https://images.pexels.com/photos/32988651/pexels-photo-32988651.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A single drop of midnight-blue sapphire resting on a whisper-fine 18K chain. This is the piece patrons reach for when an evening calls for quiet drama — one stone, one glance, nothing more needed."],
  [2,"necklace","Cyan Necklace",3199,"https://images.pexels.com/photos/10215179/pexels-photo-10215179.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Glacier-cyan stones graded to catch cold light and hold it. Worn against black or white, the Cyan reads like a line of winter sky brought indoors."],
  [3,"necklace","Diamond Necklace",2119,"https://images.pexels.com/photos/12427695/pexels-photo-12427695.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The maison's classic solitaire line: a single brilliant-cut diamond centred on an unadorned chain, cut to flash from across a room while whispering up close."],
  [4,"necklace","Diamond Necklace",3199,"https://images.pexels.com/photos/20100105/pexels-photo-20100105.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A graduated rivière of diamonds, each stone stepped a breath larger than the last. The effect is a slow crescendo of light that finishes at the hollow of the throat."],
  [5,"necklace","Diamond Necklace",1399,"https://images.pexels.com/photos/7541803/pexels-photo-7541803.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The gentlest entry into the diamond wardrobe — a petite brilliant on a fine trace chain, made for every day and impossible to overdo."],
  [6,"necklace","Diamond Necklace",6799,"https://images.pexels.com/photos/20455782/pexels-photo-20455782.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The crown piece of the archive. A cathedral-set diamond of uncommon fire, flanked by a halo of smaller stones — the necklace the atelier will not alter, because nothing about it asks to be changed."],
  [7,"necklace","Triple Gold Layer Necklace",3199,"https://images.pexels.com/photos/14999288/pexels-photo-14999288.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Three cascading chains of warm gold, each length tuned so the layers move independently and settle perfectly. One clasp, three necklaces' worth of presence."],
  [8,"necklace","Flower Necklace",3199,"https://images.pexels.com/photos/34461220/pexels-photo-34461220.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A sculpted blossom opens at the centre of this piece, its petals burnished to hold shadow the way real petals hold dew. Spring, made permanent."],
  [9,"necklace","Heart Necklace",1399,"https://images.pexels.com/photos/19821929/pexels-photo-19821929.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "An open heart silhouette drawn in one continuous line of gold — the classic first-gift necklace, given for anniversaries, first dates remembered, and promises kept."],
  [10,"necklace","Yellow Pearl Necklace",5359,"https://images.pexels.com/photos/12231889/pexels-photo-12231889.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A strand of rare golden pearls, each one warmed to the colour of late-afternoon sun. Among the maison's most precious pieces, it leaves the atelier exactly as nature intended."],
  [11,"necklace","Green Pearl Necklace",2119,"https://images.pexels.com/photos/17925116/pexels-photo-17925116.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Jade-green pearls with a soft, oceanic lustre — an unexpected colour that flatters every skin tone and starts more conversations than any diamond."],
  [12,"necklace","White Diamond Necklace",1759,"https://images.pexels.com/photos/7134458/pexels-photo-7134458.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Icy white pavé set in a slender bar of white gold. Minimal in outline, maximal in sparkle — the necklace equivalent of a perfectly pressed white shirt."],
  [13,"necklace","LOVE Word Necklace",5359,"https://images.pexels.com/photos/15576969/pexels-photo-15576969.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The word itself, written in stones: L-O-V-E spelled out in diamond-set letters. Unsubtle in the best possible way — a declaration you can clasp."],
  [14,"necklace","White Small Stone Necklace",1759,"https://images.pexels.com/photos/4595723/pexels-photo-4595723.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A fine dusting of small white stones along a delicate chain, like frost on a branch. Made for necklines that want light without weight."],
  [15,"necklace","Rose & White Gold Necklace",2119,"https://images.pexels.com/photos/19564918/pexels-photo-19564918.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Two golds entwined — blushing rose and cool white — twisted into a single cord. A piece about pairs: two metals, two moods, two people."],
  [16,"necklace","Yellow & White Gold Necklace",1759,"https://images.pexels.com/photos/16935588/pexels-photo-16935588.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Sun and moon in one necklace: alternating links of yellow and white gold that shift character with the light and pair with every other piece you own."],
  [17,"necklace","White Gold Diamond Necklace",5359,"https://images.pexels.com/photos/7541801/pexels-photo-7541801.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A signature composition of white gold latticework carrying a constellation of diamonds. Architectural, luminous, and protected by the atelier as one of its defining works."],
  [18,"necklace","Flower Petal Pattern Necklace",2119,"https://images.pexels.com/photos/34333050/pexels-photo-34333050.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Petals engraved in repeating relief circle the collar, so the pattern only fully reveals itself as you move. A quiet piece with a long second look."],
  [19,"necklace","Small Three Flower Necklace",2119,"https://images.pexels.com/photos/16879656/pexels-photo-16879656.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Three miniature blossoms in a row — past, present and future, as the atelier tells it. A favourite gift between mothers and daughters."],
  [20,"necklace","Beautiful Gold Necklace",1039,"https://images.pexels.com/photos/17368723/pexels-photo-17368723.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Nothing but gold, drawn into a clean, confident line. The most affordable necklace in the archive and the one that proves elegance owes nothing to excess."],
  [21,"necklace","Simple White Gold Necklace",5359,"https://images.pexels.com/photos/29502933/pexels-photo-29502933.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Deceptively plain: a seamless ribbon of white gold whose perfection of finish is the whole point. The hardest piece in the archive to make, and it shows — quietly."],
  [22,"necklace","Diamond Cult Necklace",1759,"https://images.pexels.com/photos/37798256/pexels-photo-37798256.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The piece patrons nickname 'the cult' — an angular diamond-set pendant with a following of repeat buyers. Bold geometry for wearers who lead with intent."],
  [23,"necklace","White Heart Necklace",2119,"https://images.pexels.com/photos/6709148/pexels-photo-6709148.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A heart carved in porcelain-white stone and rimmed in gold — softer than metal, warmer than diamond, and devoted to the romantics."],
  [24,"necklace","Small Clove Necklace",1759,"https://images.pexels.com/photos/16082501/pexels-photo-16082501.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A clove-bud charm no larger than a fingertip, modelled on the spice that once travelled further than gold. For collectors of small, meaningful things."],
  [25,"necklace","Peacock Feather Necklace",5359,"https://images.pexels.com/photos/8656236/pexels-photo-8656236.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A peacock plume rendered stone by stone, its eye a pool of blue-green fire. The showpiece of the collection — worn alone, above a low neckline, to full effect."],
  [26,"necklace","Green Diamond Necklace",5359,"https://images.pexels.com/photos/9322933/pexels-photo-9322933.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Rare green-hued stones set deep in gold, the colour of forest light. Among the maison's most precious pieces — inscription only, alteration never."],
  [27,"necklace","Pink Flower Necklace",5359,"https://images.pexels.com/photos/9173459/pexels-photo-9173459.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A rose-pink blossom caught mid-bloom, petals tipped with pavé. Feminine without apology, and one of the atelier's protected signature works."],
  [28,"necklace","Triple Layer Gold Necklace",5359,"https://images.pexels.com/photos/4889719/pexels-photo-4889719.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Three tiers of gold in three different link patterns, composed to be worn as one. The maison's masterclass in layering, delivered in a single clasp."],
  [29,"necklace","Five Layer White Gold Pearl Necklace",5359,"https://images.pexels.com/photos/23495720/pexels-photo-23495720.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Five graduated strands of white-gold chain and seed pearls, from choker to drop. A ceremonial piece — brides, galas, portraits — with the presence of an heirloom."],
  [30,"necklace","Spiral Pink Necklace",5359,"https://images.pexels.com/photos/34444213/pexels-photo-34444213.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A sculpted spiral of pink-toned gold that coils like a ribbon frozen mid-turn. Kinetic, romantic, and kept exactly as designed — the atelier alters nothing here."],
  [31,"earrings","Rose Gold Earrings",2219,"https://images.pexels.com/photos/34365842/pexels-photo-34365842.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Petal-soft studs in blushing rose gold, sized for daily wear and finished to a mirror warmth that flatters at close range — where earrings live."],
  [32,"earrings","Rose Gold Star Earrings",1859,"https://images.pexels.com/photos/16858919/pexels-photo-16858919.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Five-pointed stars in rose gold that sit flat and catch light at the tips. Worn by patrons who like their celestial jewellery understated."],
  [33,"earrings","Gold Leaf Earrings",2219,"https://images.pexels.com/photos/12144990/pexels-photo-12144990.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A pair of sculpted leaves veined by hand-engraving, one subtly mirrored against the other — because in nature no two leaves match."],
  [34,"earrings","24K Gold Leaf Earrings",1119,"https://images.pexels.com/photos/7248760/pexels-photo-7248760.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Featherweight leaves in pure 24-karat gold, thin enough to tremble as you speak. The most affordable earrings in the archive, and often the first OPALÉRA purchase."],
  [35,"earrings","Gold Pearl Earrings",4799,"https://images.pexels.com/photos/11365012/pexels-photo-11365012.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A luminous pearl cupped in a golden calyx, one for each ear. The finest earrings the maison holds — protected pieces, offered with inscription only."],
  [36,"earrings","Peacock Gold Earrings",2589,"https://images.pexels.com/photos/4155252/pexels-photo-4155252.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The peacock's fan miniaturised in gold filigree, light enough for all-day wear, intricate enough to reward anyone who leans in."],
  [37,"earrings","Blue Peacock Long Gold Earrings",1819,"https://images.pexels.com/photos/4155247/pexels-photo-4155247.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Shoulder-grazing drops in gold and peacock blue that move a half-beat behind you. Made for dancing, dinners, and doorways worth pausing in."],
  [38,"earrings","Pink-White Diamond Earrings",2039,"https://images.pexels.com/photos/13595660/pexels-photo-13595660.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Alternating pink and white stones in a twin-halo setting — sugar and ice in the same breath. A romantic's answer to the classic diamond stud."],
  [39,"earrings","Pink-Green-White Diamond Earrings",2079,"https://images.pexels.com/photos/34501351/pexels-photo-34501351.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Three colours of stone — blush, spring green and white — clustered like a posy behind glass. The most painterly pieces in the earring drawer."],
  [40,"earrings","Pink Stone Jhumka Earrings",2039,"https://images.pexels.com/photos/9430429/pexels-photo-9430429.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A classic jhumka bell reimagined with pink stones fringing its rim, chiming softly with movement. Heritage craft, maison finish."],
  [41,"earrings","Red-Green Heart Earrings",1669,"https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Twin hearts, one ruby-red and one garden-green, worn as a mismatched pair on purpose. Playful jewellery for people who don't take love too solemnly."],
  [42,"earrings","Beautiful Pearl-Diamond Earrings",1859,"https://images.pexels.com/photos/4974343/pexels-photo-4974343.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A pearl below, a diamond above — the oldest pairing in jewellery, balanced here so neither outshines the other. Timeless is the only word."],
  [43,"earrings","Small Pink Diamond Earrings",2219,"https://images.pexels.com/photos/28389453/pexels-photo-28389453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Petite pink stones in four-claw settings, scaled for second piercings and minimalists. Small enough to forget, pretty enough that others won't."],
  [44,"earrings","Pink Diamond Leaf Earrings",3329,"https://images.pexels.com/photos/13219289/pexels-photo-13219289.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Leaf silhouettes paved edge-to-edge in pink stones, curving gently with the ear. The pair the display case sells all by itself."],
  [45,"earrings","Beautiful Swan Shaped Earrings",1119,"https://images.pexels.com/photos/33737455/pexels-photo-33737455.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A swan mid-glide, neck curved in polished gold — grace as a shape. Light on the ear, lighter on the budget, beloved by ballet mothers."],
  [46,"earrings","Fire Stone Earrings",2219,"https://images.pexels.com/photos/8274718/pexels-photo-8274718.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Stones cut to burn orange-red at their core, like embers behind glass. Autumn jewellery, worn best with the collars turned up."],
  [47,"earrings","Yellow Stone Earrings",1819,"https://images.pexels.com/photos/4004225/pexels-photo-4004225.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Citrine-yellow stones set in warm gold — bottled sunshine for grey mornings. The pair patrons say they get complimented on at work."],
  [48,"earrings","Yellow Gold Stud Earrings",2589,"https://images.pexels.com/photos/12168883/pexels-photo-12168883.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The definitive gold stud: domed, seamless, hand-polished for hours. A lifetime piece that will outlast every trend it quietly ignores."],
  [49,"earrings","Diamond Earrings",2219,"https://images.pexels.com/photos/16242338/pexels-photo-16242338.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Brilliant-cut diamond solitaires in a knife-edge setting that all but disappears, leaving two points of pure light. The last studs you'll need to buy."],
  [50,"earrings","Beautiful Abstract Earrings",2959,"https://images.pexels.com/photos/32989025/pexels-photo-32989025.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Free-form curves of gold that resolve into a different shape from every angle — part sculpture, part jewellery, entirely a signature."],
  [51,"pendant","Pearl Pendant",1869,"https://images.pexels.com/photos/14584454/pexels-photo-14584454.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A single pearl of deep lustre on an adjustable chain — the pendant the maison recommends when someone asks, simply, 'where do I begin?'"],
  [52,"pendant","Purple-Orange Stone Pendant",1869,"https://images.pexels.com/photos/35532662/pexels-photo-35532662.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Sunset in a setting: a violet stone shading into amber-orange, no two examples exactly alike. For wearers drawn to colour before convention."],
  [53,"pendant","Orange-Green Pearl Pendant",1419,"https://images.pexels.com/photos/10556215/pexels-photo-10556215.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A rare two-tone pearl, citrus and moss, hung from a bail of plain gold so the colour does the talking. Nature's own experiment, mounted."],
  [54,"pendant","Black-White Pearl Pendant",2149,"https://images.pexels.com/photos/10877350/pexels-photo-10877350.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A black pearl and a white pearl stacked in one drop — midnight and morning on a single chain. The maison's study in contrast."],
  [55,"pendant","Purple Heart Pendant",959,"https://images.pexels.com/photos/13292938/pexels-photo-13292938.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "An amethyst-purple heart at the archive's gentlest price — proof the maison keeps its promise that real jewellery starts within reach."],
  [56,"pendant","Light Blue Heart Pendant",4159,"https://images.pexels.com/photos/5370705/pexels-photo-5370705.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A pale-blue heart the colour of shallow water, cut deep to glow from within. One of the most precious pendants in the vault — inscription only."],
  [57,"pendant","Purple Clove Pendant",3659,"https://images.pexels.com/photos/12197267/pexels-photo-12197267.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The clove motif returned in royal purple, scaled up into a statement drop. Spice-trade history, dressed for evening."],
  [58,"pendant","Bird Pendant",3249,"https://images.pexels.com/photos/32988665/pexels-photo-32988665.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A small bird caught at the moment of takeoff, wings half-open in gold. Given for graduations, new cities, and every other kind of first flight."],
  [59,"pendant","LOVE Letter Pendant",3249,"https://images.pexels.com/photos/38290052/pexels-photo-38290052.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The word LOVE in flowing script, cast as one unbroken line of gold — a letter that never needs posting."],
  [60,"pendant","I Love You With Arrow Pendant",3249,"https://images.pexels.com/photos/5370650/pexels-photo-5370650.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "'I love you' pierced by Cupid's arrow, spelled out in gold and worn at the collarbone. As direct as jewellery gets, by design."],
  [61,"pendant","Simple White Pearl Pendant",3249,"https://images.pexels.com/photos/34444209/pexels-photo-34444209.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "One white pearl, one fine chain, nothing else. The pendant stylists borrow for photoshoots when the brief says 'effortless'."],
  [62,"pendant","Infinity Pendant",3249,"https://images.pexels.com/photos/9280250/pexels-photo-9280250.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The infinity loop drawn in polished gold — a figure with no beginning to find and no end to reach. The maison's most-gifted anniversary piece."],
  [63,"pendant","Heart With Love Pendant",3249,"https://images.pexels.com/photos/34399039/pexels-photo-34399039.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A heart frame holding the word 'love' suspended at its centre, so the message floats inside the symbol. Two declarations, one drop."],
  [64,"pendant","Cute Bow Pendant",3249,"https://images.pexels.com/photos/4735885/pexels-photo-4735885.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A ribbon bow tied in gold, its loops caught mid-flutter — jewellery as gift-wrap, for someone who is the present."],
  [65,"pendant","Heart Infinity Pendant",3249,"https://images.pexels.com/photos/12638795/pexels-photo-12638795.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A heart woven through the infinity loop in a single unbroken line — love, extended indefinitely. Frequently inscribed with a date."],
  [66,"pendant","Double Heart Pendant",3249,"https://images.pexels.com/photos/34372585/pexels-photo-34372585.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Two interlocked hearts, one polished bright and one satin-brushed — alike, but not identical, exactly as it should be."],
  [67,"pendant","Double Infinity Pendant",3249,"https://images.pexels.com/photos/7679824/pexels-photo-7679824.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Two infinity symbols crossed over each other — the atelier's quiet mathematics for 'always, twice over'."],
  [68,"pendant","Rose Gold Infinity Heart Pendant",3249,"https://images.pexels.com/photos/10983782/pexels-photo-10983782.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The heart-and-infinity motif recast in blushing rose gold, softer and warmer than its white-gold sibling. Most often unwrapped in February."],
  [69,"pendant","Infinity Circle Pendant",3249,"https://images.pexels.com/photos/4155254/pexels-photo-4155254.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "An infinity loop enclosed in a perfect circle — endlessness, contained. A subtle piece for wearers who prefer their symbolism private."],
  [70,"pendant","Kitty Pendant",3249,"https://images.pexels.com/photos/7679654/pexels-photo-7679654.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A kitten's face in gold outline, ears pricked, whiskers implied. The archive's most-smiled-at pendant, and unapologetic about it."],
  [71,"pendant","Cute Star Pendant",3249,"https://images.pexels.com/photos/34505711/pexels-photo-34505711.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A tiny star with softly rounded points, hung slightly off-centre so it sits like a real one — imperfectly, charmingly."],
  [72,"pendant","Heart Cylinder Pendant",3249,"https://images.pexels.com/photos/4741711/pexels-photo-4741711.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A gold cylinder engraved with a band of hearts, hollow at its core — patrons tuck a paper wish inside before the first wearing."],
  [73,"pendant","Rose Pendant",3249,"https://images.pexels.com/photos/19783942/pexels-photo-19783942.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A rose in full bloom, each petal individually formed and shaded by polish alone. The garden's queen, rendered permanent."],
  [74,"pendant","Classic Pendant",3249,"https://images.pexels.com/photos/36854160/pexels-photo-36854160.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The maison's house pendant: a clean teardrop of gold with a single set stone, designed to be worn daily for decades and inherited afterwards."],
  [75,"pendant","Abstract Pendant",3249,"https://images.pexels.com/photos/9428788/pexels-photo-9428788.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "An asymmetric sweep of gold that suggests a wave, a wing, a signature — depending on who's looking. Art-gallery jewellery, wearable daily."],
  [76,"pendant","Triple Stone Pendant",3249,"https://images.pexels.com/photos/8369437/pexels-photo-8369437.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Three stones descending in size down a single drop — yesterday, today and tomorrow, in the atelier's telling. A storyteller's pendant."],
  [77,"pendant","Signature Pendant",3249,"https://images.pexels.com/photos/29033684/pexels-photo-29033684.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "The pendant that carries the maison's own hallmark motif — the rotated lozenge of OPALÉRA itself, set with a solitary stone. Wearing the house, literally."],
  [78,"pendant","Double Butterfly Pendant",3249,"https://images.pexels.com/photos/4735890/pexels-photo-4735890.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "Two butterflies in flight, the smaller trailing the larger — a mother-and-child favourite, engraved more often than any other pendant."],
  [79,"pendant","Hexagon Pendant",3249,"https://images.pexels.com/photos/735276/pexels-photo-735276.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A precise gold hexagon framing a set stone — geometry as ornament. The pendant of choice for patrons from the sciences, the atelier notes fondly."],
  [80,"pendant","Heart Butterfly Pendant",3249,"https://images.pexels.com/photos/34317579/pexels-photo-34317579.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "A heart whose upper curves resolve into butterfly wings — love, about to take flight. The archive's closing piece, and its most hopeful."]
  ];

  const products = P.map(([id,category,name,price,img,desc])=>({id,category,name,price,img,desc}));
  const byId = new Map(products.map(p=>[p.id,p]));

  const SPEC = {
    necklace:"Amulette de Cartier necklace, XS model, 18K white pearl, onyx, set with a brilliant-cut diamond of 0.02 carats. Diameter of motif: 12 mm. Adjustable chain: 38–41 cm.",
    earrings:"Amulette de Cartier earrings, XS model, 18K yellow gold, white mother-of-pearl, set with 2 brilliant-cut diamonds totaling 0.05 carats. Diameter of motifs: 12 mm.",
    pendant:"Paris Nouvelle Vague pendant, 18K pink gold, set with 114 diamonds totaling 5.27 carats. Diameter of motif: 12 mm. Adjustable chain: 38–41 cm. XS model, 18K gold."
  };
  const METAL = {necklace:"18K white gold, pearl & onyx", earrings:"18K yellow gold & mother-of-pearl", pendant:"18K pink gold, diamond pavé"};

  const fmt = n => "R " + n.toLocaleString("en-ZA");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  /* catalogue images are absolute Pexels URLs now — no CDN prefixing */
  const webSrc = p => p.img;

  function stoneOf(p){
    const n = p.name.toLowerCase();
    if(n.includes("sapphire")) return "Sapphire";
    if(n.includes("diamond")) return "Diamond";
    if(n.includes("pearl")) return "Pearl";
    if(n.includes("stone")) return "Gemstone";
    return {necklace:"Onyx & Diamond", earrings:"Mother-of-Pearl & Diamond", pendant:"Diamond Pavé"}[p.category];
  }
  function metalOf(p){
    const n = p.name.toLowerCase();
    if(n.includes("rose gold") || n.includes("pink gold")) return "18K rose gold";
    if(n.includes("yellow gold") || n.includes("24k gold")) return "18K yellow gold";
    if(n.includes("white gold")) return "18K white gold";
    return {necklace:"18K white gold", earrings:"18K yellow gold", pendant:"18K rose gold"}[p.category];
  }
  /* first recognisable motif word in the piece's own name — used to make
     generated text actually describe *this* piece */
  const MOTIF_WORDS = ["heart","flower","peacock","swan","star","butterfly","bow","kitty",
    "bird","infinity","hexagon","spiral","circle","leaf","clove","jhumka","abstract",
    "classic","signature","word","letter","arrow","cylinder","cult"];
  const motifOf = p => MOTIF_WORDS.find(w => p.name.toLowerCase().includes(w)) || null;

  /* ================= PER-ITEM DESCRIPTION & SPEC =================
     Deterministic per product.id (h32 seed), so text stays stable across
     visits but is genuinely different piece to piece. The hand-written
     descriptions in the catalogue above take precedence; descOf() covers
     manager-added pieces that have no hand-written text yet, and specOf()
     gives every piece its own craftsmanship line. */
  const DESC_OPENERS = {
    necklace: [
      p=>`This necklace is designed to sit right at the collarbone, catching the light with every turn of the head.`,
      p=>`Built for everyday elegance — light enough to wear from morning meetings straight through to dinner.`,
      p=>`This piece anchors any neckline, whether layered with a favourite chain or worn alone as the statement.`,
      p=>`The ${p.name} is the kind of necklace you reach for first — quiet luxury that's easy to actually wear.`,
      p=>`Made for the moments that call for a little more polish, without ever trying too hard.`
    ],
    earrings: [
      p=>`The ${p.name} is cut to catch the light with the smallest turn of the head — noticeable without shouting.`,
      p=>`Light enough for all-day wear, with just enough presence to carry a look on its own.`,
      p=>`Designed to sit comfortably from a morning commute through to an evening out, no second earrings needed.`,
      p=>`A pair built to be reached for often — the kind that quietly becomes part of your everyday.`,
      p=>`This design frames the face rather than competing with it, which is exactly the point.`
    ],
    pendant: [
      p=>`The ${p.name} hangs at exactly the length to draw the eye without overwhelming the neckline.`,
      p=>`A pendant built to be worn daily, then handed down as the piece with a story attached.`,
      p=>`Simple enough for layering, striking enough to wear completely on its own.`,
      p=>`Designed as a single, deliberate focal point rather than another piece competing for attention.`,
      p=>`The kind of pendant that ends up worn far more often than it was ever expected to be.`
    ]
  };
  const STONE_LINES = [
    (stone,metal)=>`Set in ${metal}, the ${stone.toLowerCase()} is hand-selected in the atelier for clarity and cut before it's ever set.`,
    (stone,metal)=>`The ${stone.toLowerCase()} takes the centre, framed by ${metal} polished to a mirror finish.`,
    (stone,metal)=>`${metal} forms the base here, with the ${stone.toLowerCase()} set to catch light from every angle.`,
    (stone,metal)=>`Every ${stone.toLowerCase()} is checked by hand against the maison's own clarity standard before it's set in ${metal}.`
  ];
  const MOTIF_LINES = [
    motif=>`The ${motif} motif gives it a silhouette you won't mistake for anything else in your jewellery box.`,
    motif=>`Its ${motif}-inspired design is a small, deliberate detail rather than a loud one.`,
    motif=>`The ${motif} shape is worked in by hand, not stamped — look closely and you'll see it.`
  ];
  const CRAFT_LINES = [
    ()=>`Every detail — from the finish to the clasp — is checked by hand before it leaves the atelier.`,
    ()=>`Finished by hand, so no two pieces catch the light in quite the same way.`,
    ()=>`Built to hold up to daily wear without ever losing its finish.`
  ];
  const CLOSERS = {
    entry: [
      `An easy first piece if you're building a fine jewellery collection.`,
      `Priced for everyday wear, without feeling like an everyday piece.`
    ],
    mid: [
      `Substantial enough for special occasions, versatile enough for daily wear.`,
      `The kind of piece that quietly upgrades whatever you're already wearing.`
    ],
    luxury: [
      `A statement piece, reserved for the occasions that deserve it.`,
      `This is heirloom territory — the sort of piece that gets passed down, not packed away.`
    ]
  };
  const priceTier = p => p.price < 1800 ? "entry" : p.price < 3500 ? "mid" : "luxury";
  function descOf(p){
    const h = h32(p.id*40503 + 7);
    const stone = stoneOf(p), metal = metalOf(p), motif = motifOf(p);
    const opener = DESC_OPENERS[p.category][h % DESC_OPENERS[p.category].length](p);
    const stoneLine = STONE_LINES[(h>>>3) % STONE_LINES.length](stone, metal);
    const midLine = motif
      ? MOTIF_LINES[(h>>>6) % MOTIF_LINES.length](motif)
      : CRAFT_LINES[(h>>>6) % CRAFT_LINES.length]();
    const closer = CLOSERS[priceTier(p)][(h>>>9) % CLOSERS[priceTier(p)].length];
    return `${opener} ${stoneLine} ${midLine} ${closer}`;
  }
  const DIM_RANGES = {
    necklace: h=>`Adjustable chain: ${38 + (h%5)}–${45 + (h%5)} cm. Motif width: ~${10 + (h>>>2)%9} mm.`,
    pendant:  h=>`Adjustable chain: ${38 + (h%5)}–${45 + (h%5)} cm. Pendant drop: ~${14 + (h>>>2)%12} mm.`,
    earrings: h=>`Drop length: ~${16 + (h%18)} mm. Sold as a pair, secure ${(h>>>4)%2 ? "lever-back" : "push-back"} fastening.`
  };
  function specOf(p){
    const h = h32(p.id*9176 + p.price*13 + 3);
    const stone = stoneOf(p), metal = metalOf(p);
    return `${p.name}, ${metal}, set with ${stone.toLowerCase()}. ${DIM_RANGES[p.category](h)}`;
  }

  /* signature pieces: everything at or above the tenth-highest price */
  const SIG_PRICES = [...products].map(p=>p.price).sort((a,b)=>b-a);
  const SIG_CUT = SIG_PRICES.length >= 10 ? SIG_PRICES[9] : Infinity;
  const isSignature = p => p.price >= SIG_CUT;

  /* deterministic SAMPLE ratings & seed reviews (back-end replaces later) */
  function h32(n){ n=(n^61)^(n>>>16); n=n+(n<<3); n=n^(n>>>4); n=Math.imul(n,0x27d4eb2d); return (n^(n>>>15))>>>0; }
  const REV_NAMES=["Naledi M.","Sipho K.","Aisha P.","Lerato D.","Thandi N.","Pieter V.","Zanele S.","Kagiso R.","Anele B.","Megan J.","Tebogo L.","Farhana I."];
  const REV_TEXTS=[
   "Arrived beautifully boxed — it looks far more expensive than it is.",
   "The stone catches the light exactly like the photos. Compliments all evening.",
   "Bought it for my mother's birthday and she hasn't taken it off since.",
   "The quality feels solid, the clasp is secure, and delivery was quick.",
   "The photographs don't do it justice — even lovelier in person.",
   "Understated and elegant. I wear it to work every single day.",
   "The certificate gave me real peace of mind buying jewellery online.",
   "Second piece I've ordered from the maison — the consistency is superb.",
   "The packaging alone felt like a gift. The piece itself is a treasure.",
   "True to the pictures and the finish is immaculate. Highly recommend.",
   "My fiancée teared up when she opened the box. Worth every rand.",
   "Gorgeous craftsmanship for the price — I was genuinely surprised."
  ];
  const seedOf = new Map(products.map(p=>{
    const h = h32(p.id*2654435761 % 4294967296);
    const rating = 4.2 + (h % 9)/10;
    const count = 8 + ((h>>>4) % 33);
    const n = 2 + (h % 2);
    const revs = Array.from({length:n},(_,i)=>({
      stars: 4 + (((h>>>(6+i*3)) % 10) > 3 ? 1 : 0),
      text: REV_TEXTS[(h>>>(3+i*5)) % REV_TEXTS.length],
      name: REV_NAMES[(h>>>(7+i*4)) % REV_NAMES.length],
      verified: ((h>>>(9+i)) % 3) > 0
    }));
    return [p.id, {rating, count, revs}];
  }));
  const store = {
    get(k,d){ try{ const v = JSON.parse(localStorage.getItem(k)); return v===null||v===undefined ? d : v; }catch(e){ return d; } },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  function ratingOf(p){
    const s = seedOf.get(p.id);
    const mine = store.get("opalera.reviews", []).filter(r=>r.pid===p.id);
    const total = s.count + mine.length;
    const sum = s.rating*s.count + mine.reduce((a,r)=>a+r.stars,0);
    return { avg: sum/total, count: total };
  }
  function starStr(avg){
    const f = Math.round(avg);
    return "★".repeat(f) + `<span class="dim">${"★".repeat(5-f)}</span>`;
  }
  function boutiqueEst(p){
    const h = h32(p.id*97);
    return Math.round(p.price*(1.9 + (h%6)/10)/50)*50;   /* SAMPLE comparison */
  }

  /* ================= COMMERCE CONSTANTS ================= */
  const VAT_RATE = 0.15;                       /* South African VAT, prices are VAT-inclusive */
  const PROMOS = { GEM10: 0.10, OPAL5: 0.05 }; /* demo promo codes -> discount fraction */
  const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State",
                     "Limpopo","Mpumalanga","North West","Northern Cape"];

  /* ================= ADMIN OVERLAYS (localStorage; DB later) =================
     The manager's edits never touch this file — they live as overlays that
     every page reads: stock levels, hidden pieces, and manager-added pieces. */
  const hiddenIds = () => new Set(store.get("opalera.hidden", []));
  function setHidden(id, hide){
    const h = hiddenIds();
    hide ? h.add(id) : h.delete(id);
    store.set("opalera.hidden", [...h]);
  }
  const customProducts = () => store.get("opalera.custom", []);
  function addCustomProduct(p){
    const list = customProducts();
    const id = 1000 + list.length + 1;
    list.push({ id, category:p.category, name:p.name, price:p.price,
                img:p.img || "", desc:p.desc || "" , custom:true });
    store.set("opalera.custom", list);
    return id;
  }
  function allProducts(){
    const h = hiddenIds();
    return [...products.filter(p=>!h.has(p.id)), ...customProducts()];
  }
  function findProduct(id){
    return byId.get(id) || customProducts().find(p=>p.id===id) || null;
  }

  /* stock: deterministic seed per piece, manager overrides via overlay */
  const stockSeed = id => 3 + (h32(id*31) % 20);
  function stockOf(id){
    const o = store.get("opalera.stock", {});
    return (id in o) ? o[id] : stockSeed(id);
  }
  function setStock(id, qty){
    const o = store.get("opalera.stock", {});
    o[id] = Math.max(0, qty|0);
    store.set("opalera.stock", o);
  }

  /* thumbs up / down: SAMPLE seed baseline + real votes on top */
  function voteSeed(id){
    const h = h32(id*53);
    return { up: 6 + (h % 34), down: 1 + ((h>>>5) % 6) };
  }
  function votesOf(id){
    const seed = voteSeed(id);
    const real = store.get("opalera.votes", {})[id] || { up:0, down:0 };
    const up = seed.up + real.up, down = seed.down + real.down;
    return { up, down, pct: Math.round(up/(up+down)*100) };
  }
  function castVote(id, dir){            /* dir: 1 up, -1 down; one vote per browser per piece */
    const mine = store.get("opalera.myvotes", {});
    const votes = store.get("opalera.votes", {});
    const v = votes[id] || (votes[id] = { up:0, down:0 });
    if(mine[id] === dir) {               /* tap again to undo */
      dir === 1 ? v.up-- : v.down--;
      delete mine[id];
    } else {
      if(mine[id] === 1) v.up--;
      if(mine[id] === -1) v.down--;
      dir === 1 ? v.up++ : v.down++;
      mine[id] = dir;
    }
    store.set("opalera.votes", votes);
    store.set("opalera.myvotes", mine);
    return { mine: mine[id] || 0, ...votesOf(id) };
  }
  const myVote = id => store.get("opalera.myvotes", {})[id] || 0;

  /* ================= SAMPLE SALES HISTORY (for the Reports feature) =================
     Deterministic 19 months of trading history so the dashboard can show
     year/month trends before the back-end exists. Real localStorage orders
     are merged on top by the admin page. Clearly SAMPLE data. */
  const MONTHS = [];
  (function(){
    for(let y=2025, m=1; y<2026 || (y===2026 && m<=7); m++){
      if(m===13){ m=1; y++; }
      MONTHS.push(`${y}-${String(m).padStart(2,"0")}`);
      if(y===2026 && m===7) break;
    }
  })();
  function salesHistory(){
    /* gentle upward trend + seasonal bumps (Feb: Valentine's, Dec: festive) */
    return MONTHS.map((month, i) => {
      const h = h32((i+7)*911);
      const season = month.endsWith("-02") ? 9 : month.endsWith("-12") ? 13 : 0;
      const units = 12 + Math.round(i*0.9) + (h % 7) + season;
      const catSplit = { necklace: 0.34 + (h%9)/100, earrings: 0.27 + ((h>>>3)%7)/100 };
      const necklaces = Math.round(units*catSplit.necklace);
      const earrings = Math.round(units*catSplit.earrings);
      const pendants = units - necklaces - earrings;
      const revenue = necklaces*3300 + earrings*2100 + pendants*2900 + (h % 900);
      const prov = PROVINCES.map((p,j)=>({ province:p,
        units: Math.max(0, Math.round(units * [0.30,0.22,0.16,0.08,0.05,0.05,0.06,0.05,0.03][j] + ((h>>>j)%3) - 1)) }));
      return { month, units, revenue, necklaces, earrings, pendants, provinces: prov, sample:true };
    });
  }

  /* shared auth (same localStorage schema as the main page) */
  async function hashPw(pw){
    try{
      const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("opalera·"+pw));
      return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
    }catch(e){
      let h=5381; const s="opalera·"+pw;
      for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0;
      return "djb2:"+(h>>>0).toString(16);
    }
  }
  /* ================= MAISON SERVER (real backend) =================
     Same-origin API served by opalera-backend/server.js. Patron accounts,
     carts, wishlists, orders and reviews live on the server; the signed-in
     patron is mirrored into localStorage ("opalera.serverUser") so the
     synchronous currentUser() callers across the pages keep working, and
     every page re-verifies against the server on load via authApi.me().
     The manager console keeps its own local demo account (role gate). */
  async function api(path, opts={}){
    let res;
    try{
      res = await fetch("/api"+path, {
        method: opts.method || "GET",
        headers: opts.body ? {"Content-Type":"application/json"} : undefined,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        credentials: "include"
      });
    }catch(e){
      /* fetch itself failed — the page can't reach the maison's server.
         Give an actionable message instead of the browser's "Failed to fetch". */
      throw new Error(location.protocol === "file:"
        ? "This page was opened as a file, so it can't reach the maison's server. Start it with 'node opalera-backend/server.js' and open http://localhost:3000 instead."
        : "Can't reach the maison's server. Start it with 'node opalera-backend/server.js' and open the site at http://localhost:3000.");
    }
    let data = {};
    try{ data = await res.json(); }catch(e){}
    if(!res.ok){
      const err = new Error(data.error || "Something went wrong. Please try again.");
      err.status = res.status;
      throw err;
    }
    return data;
  }
  const asLocalUser = u => u ? { email:u.email, fn:u.firstName, ln:u.lastName } : null;
  const setServerUser = u => store.set("opalera.serverUser", asLocalUser(u));
  const authApi = {
    async signup(fn, ln, em, pw){
      const { user } = await api("/auth/signup", {method:"POST", body:{firstName:fn, lastName:ln, email:em, password:pw}});
      setServerUser(user);
      return asLocalUser(user);
    },
    async login(em, pw){
      const { user } = await api("/auth/login", {method:"POST", body:{email:em, password:pw}});
      setServerUser(user);
      return asLocalUser(user);
    },
    async logout(){
      try{ await api("/auth/logout", {method:"POST"}); }catch(e){}
      store.set("opalera.serverUser", null);
      store.set("opalera.session", null);      /* clear any legacy local session too */
    },
    /* forgotten password: request a one-time code, then set a new password.
       Email delivery is simulated in this demonstration — the server returns
       the code (demoCode) with a note, the way card capture is simulated. */
    async forgot(em){
      return api("/auth/forgot", {method:"POST", body:{email:em}});
    },
    async reset(em, code, pw){
      const { user } = await api("/auth/reset", {method:"POST", body:{email:em, code, password:pw}});
      setServerUser(user);
      return asLocalUser(user);
    },
    /* verify the cookie session; on success refresh the mirror, on 401 clear
       it, and if the server is unreachable keep trusting the mirror */
    async me(){
      try{
        const { user } = await api("/auth/me");
        setServerUser(user);
        return asLocalUser(user);
      }catch(e){ return currentUser(); }
    }
  };
  /* merge this browser's guest bag & wishlist into the account that just
     signed in, push the result to the server, and mirror it locally */
  async function adoptAccount(){
    try{
      const [{ items: serverCart }, { pids: serverWish }] = await Promise.all([ api("/cart"), api("/wishlist") ]);
      const localBag = store.get("opalera.bag", []);
      const mergedBag = serverCart.concat(localBag);
      if(localBag.length) await api("/cart", {method:"PUT", body:{items: mergedBag}});
      const mergedWish = [...new Set([...serverWish, ...store.get("opalera.wishlist", [])])];
      if(mergedWish.length > serverWish.length) await api("/wishlist", {method:"PUT", body:{pids: mergedWish}});
      store.set("opalera.bag", mergedBag);
      store.set("opalera.wishlist", mergedWish);
    }catch(e){ /* keep local state if the sync fails; nothing is lost */ }
  }
  const pushBag = () => { if(currentUser()) api("/cart", {method:"PUT", body:{items: store.get("opalera.bag", [])}}).catch(()=>{}); };
  const pushWishlist = () => { if(currentUser()) api("/wishlist", {method:"PUT", body:{pids: store.get("opalera.wishlist", [])}}).catch(()=>{}); };
  /* pull all patron reviews from the server into the local mirror that
     ratingOf() and the review lists already read */
  async function pullReviews(){
    try{
      const { reviews } = await api("/reviews");
      store.set("opalera.reviews", reviews);
      return reviews;
    }catch(e){ return store.get("opalera.reviews", []); }
  }

  /* ================= SHOW/HIDE PASSWORD TOGGLES =================
     Adds an eye icon inside every password field so patrons can check
     what they typed. Injects its own CSS, so it works on every page
     that loads this file with no markup changes. */
  const EYE_OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5c2 0 3.7.6 5.1 1.4M22 12s-3.5 6.5-10 6.5c-2 0-3.7-.6-5.1-1.4"/><path d="M9.9 9.9a3 3 0 1 0 4.2 4.2"/><path d="m4 20 16-16"/></svg>';
  function attachPasswordToggles(){
    if(typeof document === "undefined") return;   /* also runs under Node for the page generator */
    if(!document.getElementById("pwToggleCss")){
      const st = document.createElement("style");
      st.id = "pwToggleCss";
      st.textContent = `
        .pwwrap{position:relative}
        .pwwrap input{width:100%;padding-right:44px !important}
        .pwtoggle{position:absolute;right:1px;top:1px;bottom:1px;width:40px;display:grid;place-items:center;
          background:none;border:none;cursor:pointer;color:#a49cb2;transition:color .3s;padding:0}
        .pwtoggle:hover{color:#f0d896}
        .pwtoggle svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}`;
      document.head.appendChild(st);
    }
    document.querySelectorAll('input[type="password"]').forEach(inp=>{
      if(inp.dataset.hasToggle) return;
      inp.dataset.hasToggle = "1";
      const wrap = document.createElement("div");
      wrap.className = "pwwrap";
      inp.parentNode.insertBefore(wrap, inp);
      wrap.appendChild(inp);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pwtoggle";
      btn.tabIndex = -1;                          /* tabbing stays on the fields */
      btn.setAttribute("aria-label", "Show password");
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = EYE_OPEN;
      btn.addEventListener("click", ()=>{
        const show = inp.type === "password";
        inp.type = show ? "text" : "password";
        btn.setAttribute("aria-pressed", String(show));
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        btn.innerHTML = show ? EYE_OFF : EYE_OPEN;
        inp.focus();
      });
      wrap.appendChild(btn);
    });
  }
  attachPasswordToggles();

  const sessionEmail = () => {
    const su = store.get("opalera.serverUser", null);
    return su ? su.email : store.get("opalera.session", null);
  };
  const currentUser = () => {
    const su = store.get("opalera.serverUser", null);
    if(su) return su;                                   /* real account on the server */
    const s = store.get("opalera.session", null);       /* legacy local account (manager console) */
    if(!s) return null;
    const u = store.get("opalera.users", {})[s];
    return u ? { email:s, ...u } : null;
  };

  /* link to a piece's own page (each of the 80 pieces has a generated page;
     manager-added pieces use the dynamic template) */
  const pageOf = p => (p.id >= 1 && p.id <= 80 && !p.custom) ? `product-${p.id}.html` : `product.html?id=${p.id}`;

  return { CDN, products, byId, SPEC, METAL, fmt, esc, webSrc, stoneOf, isSignature,
           metalOf, motifOf, descOf, specOf,
           seedOf, ratingOf, starStr, boutiqueEst, store, hashPw, sessionEmail, currentUser,
           VAT_RATE, PROMOS, PROVINCES,
           hiddenIds, setHidden, customProducts, addCustomProduct, allProducts, findProduct,
           stockOf, setStock, votesOf, castVote, myVote, MONTHS, salesHistory, pageOf,
           api, authApi, adoptAccount, pushBag, pushWishlist, pullReviews,
           attachPasswordToggles };
})();
