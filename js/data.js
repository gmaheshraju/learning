const PAIR_COLORS = ['#E85D75', '#F5A623', '#4DADEA', '#7EC850'];
const BG_LIGHT = ['#FCCDD5', '#FDE4B0', '#B8DDFB', '#C8EDB3'];
const BG_DARK = ['#5A2030', '#5A4018', '#1A3A5A', '#1E4A20'];

const CATEGORIES = [
  {
    id: 'animals', name: 'Animals', emoji: '\u{1F43E}',
    items: [
      { id: 'DOG', name: 'DOG', icon: '\u{1F436}', fact: 'Dogs wag their tail when happy!', q: 'Can you wag like a dog?', chain: 'Dogs have wet noses to smell better. Can YOU smell your food before eating?' },
      { id: 'CAT', name: 'CAT', icon: '\u{1F431}', fact: 'Cats sleep for 16 hours every day!', q: 'How many hours do YOU sleep?', chain: 'Cats can see in the dark! Their eyes glow at night.' },
      { id: 'ELEPHANT', name: 'ELEPHANT', icon: '\u{1F418}', fact: 'Elephants are the biggest land animals!', q: 'Walk heavy like an elephant!', chain: 'Baby elephants suck their trunk like babies suck their thumb!' },
      { id: 'LION', name: 'LION', icon: '\u{1F981}', fact: 'Lions are called King of the Jungle!', q: 'Can you ROAR like a lion?', chain: 'Only boy lions have the big mane. Girl lions do the hunting!' },
      { id: 'RABBIT', name: 'RABBIT', icon: '\u{1F430}', fact: 'Rabbits hop with strong back legs!', q: 'How many jumps can YOU do?', chain: 'Rabbits eat carrots and veggies. What veggies do YOU like?' },
      { id: 'FISH', name: 'FISH', icon: '\u{1F41F}', fact: 'Fish breathe underwater using gills!', q: 'Can YOU breathe underwater?', chain: 'Fish sleep with eyes open — no eyelids! Could you sleep like that?' },
      { id: 'BIRD', name: 'BIRD', icon: '\u{1F426}', fact: 'Birds are the only animals with feathers!', q: 'Flap your arms like a bird!', chain: 'Some birds fly higher than airplanes!' },
      { id: 'MONKEY', name: 'MONKEY', icon: '\u{1F435}', fact: 'Monkeys love eating bananas!', q: 'What is YOUR favorite fruit?', chain: 'Monkeys laugh and tickle each other just like us!' },
      { id: 'FROG', name: 'FROG', icon: '\u{1F438}', fact: 'Frogs jump 20 times their own size!', q: 'Jump like a frog! Ribbit!', chain: 'Frogs start as tiny tadpoles then grow legs! Like magic!' },
      { id: 'BUTTERFLY', name: 'BUTTERFLY', icon: '\u{1F98B}', fact: 'Butterflies start as caterpillars!', q: 'Name the colors of a butterfly!', chain: 'A caterpillar wraps in a cocoon and becomes a butterfly!' },
      { id: 'TURTLE', name: 'TURTLE', icon: '\u{1F422}', fact: 'Turtles carry their home on their back!', q: 'What would YOU keep in a shell?', chain: 'Some turtles live for 100 years! Older than grandma!' },
      { id: 'PARROT', name: 'PARROT', icon: '\u{1F99C}', fact: 'Parrots can learn to talk like us!', q: 'What would you teach a parrot?', chain: 'Parrots come in every rainbow color!' },
      { id: 'PENGUIN', name: 'PENGUIN', icon: '\u{1F427}', fact: 'Penguins swim fast but cannot fly!', q: 'Waddle like a penguin!', chain: 'Penguin daddies keep the egg warm on their feet!' },
      { id: 'GIRAFFE', name: 'GIRAFFE', icon: '\u{1F992}', fact: 'Giraffes are the tallest animals!', q: 'Stretch tall like a giraffe!', chain: "Giraffe tongue is purple and super long!" },
      { id: 'OWL', name: 'OWL', icon: '\u{1F989}', fact: 'Owls can see in the dark!', q: 'What do owls say? Hoo hoo!', chain: 'Owls turn their head almost all the way around!' }
    ]
  },
  {
    id: 'fruits', name: 'Fruits', emoji: '\u{1F34E}',
    items: [
      { id: 'APPLE', name: 'APPLE', icon: '\u{1F34E}', fact: 'Apples can be red, green, or yellow!', q: 'What color apple do you like best?', chain: 'There are over 7,500 types of apples in the world!' },
      { id: 'BANANA', name: 'BANANA', icon: '\u{1F34C}', fact: 'Bananas grow in big bunches on tall plants!', q: 'Can you peel a banana yourself?', chain: 'Bananas are curved because they grow towards the sun!' },
      { id: 'ORANGE_FRUIT', name: 'ORANGE', icon: '\u{1F34A}', fact: 'Oranges are full of juice inside!', q: 'Can you squeeze your hands like an orange?', chain: 'The color orange was named after the fruit!' },
      { id: 'GRAPES', name: 'GRAPES', icon: '\u{1F347}', fact: 'Grapes grow on long vines in the sunshine!', q: 'Can you pick pretend grapes above you?', chain: 'It takes about 75 grapes to make one glass of juice!' },
      { id: 'WATERMELON', name: 'WATERMELON', icon: '\u{1F349}', fact: 'Watermelons are mostly water inside!', q: 'Is watermelon bigger than your head?', chain: 'The biggest watermelon ever weighed as much as a person!' },
      { id: 'STRAWBERRY', name: 'STRAWBERRY', icon: '\u{1F353}', fact: 'Strawberries have tiny seeds on the outside!', q: 'Can you count dots on a strawberry?', chain: 'Strawberries are the only fruit with seeds on the outside!' },
      { id: 'MANGO', name: 'MANGO', icon: '\u{1F96D}', fact: 'Mangoes are sweet and come from warm places!', q: 'Can you find something yellow and orange?', chain: 'Mango is the most eaten fruit in the whole world!' },
      { id: 'CHERRY', name: 'CHERRY', icon: '\u{1F352}', fact: 'Cherries grow in pairs like best friends!', q: 'Can you hold two things like cherry twins?', chain: 'Cherry trees grow beautiful pink flowers in spring!' }
    ]
  },
  {
    id: 'vegetables', name: 'Vegetables', emoji: '\u{1F955}',
    items: [
      { id: 'CARROT', name: 'CARROT', icon: '\u{1F955}', fact: 'Carrots grow underground — you pull them out!', q: 'Pretend to pull a carrot from the ground!', chain: 'Carrots were originally purple! Orange ones came later.' },
      { id: 'TOMATO', name: 'TOMATO', icon: '\u{1F345}', fact: 'Tomatoes are red, round, and juicy!', q: 'Is a tomato a fruit or veggie? It is a fruit!', chain: 'There are over 10,000 types of tomatoes!' },
      { id: 'BROCCOLI', name: 'BROCCOLI', icon: '\u{1F966}', fact: 'Broccoli looks like a tiny tree you can eat!', q: 'Pretend to be a broccoli tree! Stand tall!', chain: 'Broccoli has more vitamin C than an orange!' },
      { id: 'CORN', name: 'CORN', icon: '\u{1F33D}', fact: 'Corn grows on tall stalks taller than you!', q: 'Can you reach up high like a corn stalk?', chain: 'Each corn cob has about 800 kernels! So many.' },
      { id: 'POTATO', name: 'POTATO', icon: '\u{1F954}', fact: 'Potatoes grow underground like hidden treasure!', q: 'Can you dig in pretend dirt for a potato?', chain: 'Potatoes were the first food grown in space!' },
      { id: 'ONION', name: 'ONION', icon: '\u{1F9C5}', fact: 'Onions have many layers inside like a ball!', q: 'Onions make people cry! Have you seen that?', chain: 'People have eaten onions for over 5,000 years!' },
      { id: 'PUMPKIN', name: 'PUMPKIN', icon: '\u{1F383}', fact: 'Pumpkins are big, round, and orange!', q: 'Make your arms round like a big pumpkin!', chain: 'The biggest pumpkin ever was as heavy as a small car!' },
      { id: 'CUCUMBER', name: 'CUCUMBER', icon: '\u{1F952}', fact: 'Cucumbers are cool and crunchy to eat!', q: 'Can you crunch like eating a cucumber?', chain: 'Cucumbers are 95% water! Almost all water.' }
    ]
  },
  {
    id: 'kitchen', name: 'Kitchen', emoji: '\u{1F373}',
    items: [
      { id: 'CUP', name: 'CUP', icon: '☕', fact: 'We drink water and milk from cups!', q: 'Pretend to sip from a cup! Sip sip!', chain: 'The first cups were made from animal horns long ago!' },
      { id: 'PLATE', name: 'PLATE', icon: '\u{1F37D}️', fact: 'We eat our food from round plates!', q: 'What is your favorite food on a plate?', chain: 'In some places, people eat food on banana leaves!' },
      { id: 'SPOON', name: 'SPOON', icon: '\u{1F944}', fact: 'Spoons help us eat soup and rice!', q: 'Can you stir pretend soup? Round and round!', chain: 'Long ago people used shells as spoons!' },
      { id: 'FORK', name: 'FORK', icon: '\u{1F374}', fact: 'Forks have pointy tips to pick up food!', q: 'How many points does a fork have? Count!', chain: 'People used to eat only with their hands!' },
      { id: 'BOWL', name: 'BOWL', icon: '\u{1F963}', fact: 'Bowls hold soup, cereal, and yummy things!', q: 'Hold your hands like a bowl shape!', chain: 'The first bowls were made from clay!' },
      { id: 'POT', name: 'POT', icon: '\u{1F372}', fact: 'Pots cook hot food on the stove!', q: 'Stir a pretend pot! Round and round!', chain: 'Some pots can cook food using just the sun!' },
      { id: 'PAN', name: 'PAN', icon: '\u{1F373}', fact: 'Pans are flat for frying food!', q: 'Flip a pretend pancake in a pan! Flip!', chain: 'The biggest pan could cook 1,000 eggs at once!' },
      { id: 'GLASS', name: 'GLASS', icon: '\u{1F95B}', fact: 'We drink juice from a see-through glass!', q: 'Can you see through a glass? Try it!', chain: 'Glass is made from sand! Hot sand turns into glass.' }
    ]
  },
  {
    id: 'house', name: 'House', emoji: '\u{1F3E0}',
    items: [
      { id: 'CHAIR', name: 'CHAIR', icon: '\u{1FA91}', fact: 'Chairs have four legs for sitting!', q: 'Count the legs on a chair! How many?', chain: 'Long ago only kings had chairs! Others sat on the floor.' },
      { id: 'TABLE', name: 'TABLE', icon: '\u{1F4CB}', fact: 'We eat and draw on tables!', q: 'What do you like to do at the table?', chain: 'Some tables fold up tiny! Like magic.' },
      { id: 'BED', name: 'BED', icon: '\u{1F6CF}️', fact: 'Beds are soft and cozy for sleeping!', q: 'Pretend to sleep! Close your eyes!', chain: 'Cats love sleeping on beds too! Just like you.' },
      { id: 'DOOR', name: 'DOOR', icon: '\u{1F6AA}', fact: 'Doors open and close to let us in!', q: 'Knock on a door! Knock knock knock!', chain: 'The oldest door is 5,000 years old and still works!' },
      { id: 'WINDOW', name: 'WINDOW', icon: '\u{1FA9F}', fact: 'Windows let sunshine come inside!', q: 'Look out a window! What do you see?', chain: 'Long ago windows had no glass! Just open holes.' },
      { id: 'LAMP', name: 'LAMP', icon: '\u{1F4A1}', fact: 'Lamps make light so we can see at night!', q: 'Turn a pretend lamp on and off! Click!', chain: 'Before lamps, people used candles and fire!' },
      { id: 'CLOCK', name: 'CLOCK', icon: '\u{1F570}️', fact: 'Clocks tell us what time it is!', q: 'Go tick-tock like a clock!', chain: 'The first clocks used shadows from the sun!' },
      { id: 'FAN', name: 'FAN', icon: '\u{1F300}', fact: 'Fans spin round to make cool air!', q: 'Spin your arm around like a fan!', chain: 'The first fans were big leaves people waved!' }
    ]
  },
  {
    id: 'vehicles', name: 'Vehicles', emoji: '\u{1F697}',
    items: [
      { id: 'CAR', name: 'CAR', icon: '\u{1F697}', fact: 'Cars have four wheels to go places!', q: 'Hold a pretend steering wheel! Vroom!', chain: 'The first cars were slower than a bicycle!' },
      { id: 'BUS', name: 'BUS', icon: '\u{1F68C}', fact: 'Buses are big and carry many people!', q: 'Wave to the bus driver! Hello!', chain: 'Some buses have two floors! You sit upstairs.' },
      { id: 'TRUCK', name: 'TRUCK', icon: '\u{1F69A}', fact: 'Trucks carry heavy things everywhere!', q: 'Honk like a big truck! BEEP BEEP!', chain: 'The biggest trucks have wheels taller than people!' },
      { id: 'BIKE', name: 'BIKE', icon: '\u{1F6B2}', fact: 'Bikes have two wheels — you pedal to go!', q: 'Pedal your legs like riding a bike!', chain: 'More people ride bikes than drive cars in the world!' },
      { id: 'TRAIN', name: 'TRAIN', icon: '\u{1F682}', fact: 'Trains go on tracks! Choo choo!', q: 'Can you go choo-choo like a train?', chain: 'The fastest trains float on magnets!' },
      { id: 'BOAT', name: 'BOAT', icon: '⛵', fact: 'Boats float on water and sail with wind!', q: 'Rock side to side like a boat on waves!', chain: 'The biggest boats are longer than three football fields!' },
      { id: 'PLANE', name: 'PLANE', icon: '✈️', fact: 'Planes have wings and fly in the sky!', q: 'Spread your arms like airplane wings!', chain: 'Planes fly higher than the tallest mountain!' },
      { id: 'ROCKET', name: 'ROCKET', icon: '\u{1F680}', fact: 'Rockets blast off into space! 3, 2, 1!', q: 'Count down! 3, 2, 1 — Jump up!', chain: 'Astronauts float inside rockets in space!' }
    ]
  },
  {
    id: 'colors', name: 'Colors', emoji: '\u{1F3A8}',
    items: [
      { id: 'CLR_RED', name: 'RED', icon: '\u{1F534}', fact: 'Red is the color of apples and fire trucks!', q: 'Find something red near you right now!', chain: 'Red is the first color babies can see!' },
      { id: 'CLR_BLUE', name: 'BLUE', icon: '\u{1F535}', fact: 'Blue is the color of the sky and ocean!', q: 'Look up! Is the sky blue today?', chain: 'Blue is the world\'s most popular favorite color!' },
      { id: 'CLR_GREEN', name: 'GREEN', icon: '\u{1F7E2}', fact: 'Green is the color of grass and leaves!', q: 'Find something green! Trees are green!', chain: 'Your eyes can see more greens than any other color!' },
      { id: 'CLR_YELLOW', name: 'YELLOW', icon: '\u{1F7E1}', fact: 'Yellow is the color of the sun and bananas!', q: 'Draw a yellow sun in the air!', chain: 'Yellow is easiest to see far away! That is why taxis are yellow.' },
      { id: 'CLR_PURPLE', name: 'PURPLE', icon: '\u{1F7E3}', fact: 'Purple is made by mixing red and blue!', q: 'What two colors make purple?', chain: 'Long ago only kings could wear purple!' },
      { id: 'CLR_PINK', name: 'PINK', icon: '\u{1F497}', fact: 'Pink is a soft red — like a flower!', q: 'Can you name a pink flower?', chain: 'Flamingos are pink because they eat pink shrimp!' },
      { id: 'CLR_BROWN', name: 'BROWN', icon: '\u{1F7E4}', fact: 'Brown is the color of chocolate and trees!', q: 'Trees have brown trunks — hug a tree!', chain: 'You make brown by mixing all colors together!' },
      { id: 'CLR_WHITE', name: 'WHITE', icon: '⚪', fact: 'White is the color of snow and clouds!', q: 'Are the clouds white and fluffy today?', chain: 'White light has all rainbow colors hiding inside!' }
    ]
  },
  {
    id: 'bodyparts', name: 'Body Parts', emoji: '\u{1F9D2}',
    items: [
      { id: 'EYES', name: 'EYES', icon: '\u{1F440}', fact: 'Your eyes blink about 15 times every minute!', q: 'How many times can you blink in 10 seconds?', chain: 'Your eyes can see over 10 million different colors!' },
      { id: 'NOSE', name: 'NOSE', icon: '\u{1F443}', fact: 'Your nose can smell over 1 trillion smells!', q: 'Sniff something! What do you smell?', chain: 'Your nose and ears never stop growing your whole life!' },
      { id: 'HAND', name: 'HAND', icon: '\u{270B}', fact: 'You have 5 fingers on each hand!', q: 'Count your fingers! How many total?', chain: 'Your fingerprints are unique — nobody else has the same ones!' },
      { id: 'EAR', name: 'EAR', icon: '\u{1F442}', fact: 'Your ears help you hear sounds all around!', q: 'Cup your ears — can you hear better?', chain: 'Your ears also help you balance so you do not fall!' },
      { id: 'TEETH', name: 'TEETH', icon: '\u{1F9B7}', fact: 'Kids have 20 baby teeth that fall out!', q: 'How many teeth do you have right now?', chain: 'Sharks grow new teeth their whole life — thousands of them!' },
      { id: 'HAIR', name: 'HAIR', icon: '\u{1F9D1}', fact: 'You have about 100,000 hairs on your head!', q: 'Touch your hair! Is it straight or curly?', chain: 'Your hair grows about as fast as grass!' },
      { id: 'FOOT', name: 'FOOT', icon: '\u{1F9B6}', fact: 'Your feet have 26 bones in each one!', q: 'Stomp your feet on the ground! Stomp stomp!', chain: 'By the time you grow up, your feet will walk around the Earth 4 times!' },
      { id: 'TONGUE', name: 'TONGUE', icon: '\u{1F445}', fact: 'Your tongue helps you taste sweet, sour, and salty!', q: 'Stick out your tongue! Can you touch your nose?', chain: 'Your tongue is the strongest muscle in your body!' }
    ]
  },
  {
    id: 'clothes', name: 'Clothes', emoji: '\u{1F455}',
    items: [
      { id: 'SHIRT', name: 'SHIRT', icon: '\u{1F455}', fact: 'Shirts cover your body and keep you warm!', q: 'What color is your shirt today?', chain: 'The first shirts were made from animal skins!' },
      { id: 'PANTS', name: 'PANTS', icon: '\u{1F456}', fact: 'Pants have two legs — one for each of yours!', q: 'Are you wearing pants or shorts today?', chain: 'Jeans were invented for gold miners to wear!' },
      { id: 'SHOES', name: 'SHOES', icon: '\u{1F45F}', fact: 'Shoes protect your feet when you walk!', q: 'Can you tie your shoes by yourself?', chain: 'The oldest shoes ever found are 5,500 years old!' },
      { id: 'HAT', name: 'HAT', icon: '\u{1F9E2}', fact: 'Hats keep the sun off your head!', q: 'Put something on your head like a hat!', chain: 'Chefs wear tall white hats called toques!' },
      { id: 'SOCKS', name: 'SOCKS', icon: '\u{1F9E6}', fact: 'Socks keep your feet warm and cozy!', q: 'What color are your socks today?', chain: 'The first socks were made from animal hair!' },
      { id: 'DRESS', name: 'DRESS', icon: '\u{1F457}', fact: 'Dresses are pretty and come in many colors!', q: 'Spin around like wearing a flowing dress!', chain: 'The longest dress ever had a tail 8 kilometers long!' },
      { id: 'JACKET', name: 'JACKET', icon: '\u{1F9E5}', fact: 'Jackets keep you warm when it is cold outside!', q: 'Pretend to zip up a jacket! Zzzzzip!', chain: 'Astronaut space suits are the most special jackets ever!' },
      { id: 'SCARF', name: 'SCARF', icon: '\u{1F9E3}', fact: 'Scarves wrap around your neck to stay warm!', q: 'Wrap something around your neck like a scarf!', chain: 'The longest scarf ever made was longer than 50 school buses!' }
    ]
  },
  {
    id: 'numbers', name: 'Numbers', emoji: '\u{1F522}',
    items: [
      { id: 'NUM_1', name: 'ONE', icon: '1\u{FE0F}\u{20E3}', fact: 'One is the very first number!', q: 'Hold up one finger!', chain: 'You have one nose, one mouth, and one belly button!' },
      { id: 'NUM_2', name: 'TWO', icon: '2\u{FE0F}\u{20E3}', fact: 'Two means a pair — like your two eyes!', q: 'Find two things that match!', chain: 'A bicycle has two wheels — bi means two!' },
      { id: 'NUM_3', name: 'THREE', icon: '3\u{FE0F}\u{20E3}', fact: 'A triangle has three sides and three corners!', q: 'Can you draw a triangle in the air?', chain: 'A traffic light has three colors: red, yellow, green!' },
      { id: 'NUM_4', name: 'FOUR', icon: '4\u{FE0F}\u{20E3}', fact: 'Dogs and cats walk on four legs!', q: 'Walk on all fours like an animal!', chain: 'A square has four equal sides!' },
      { id: 'NUM_5', name: 'FIVE', icon: '5\u{FE0F}\u{20E3}', fact: 'You have five fingers on each hand!', q: 'Give a high five! Slap!', chain: 'A starfish has five arms!' },
      { id: 'NUM_6', name: 'SIX', icon: '6\u{FE0F}\u{20E3}', fact: 'Insects have six legs — count them!', q: 'Can you count to six really fast?', chain: 'A dice has six sides with dots!' },
      { id: 'NUM_7', name: 'SEVEN', icon: '7\u{FE0F}\u{20E3}', fact: 'A rainbow has seven beautiful colors!', q: 'Name the colors of the rainbow!', chain: 'There are seven days in a week!' },
      { id: 'NUM_8', name: 'EIGHT', icon: '8\u{FE0F}\u{20E3}', fact: 'An octopus has eight long arms!', q: 'Wiggle eight fingers like an octopus!', chain: 'Spiders also have eight legs!' }
    ]
  },
  {
    id: 'shapes', name: 'Shapes', emoji: '\u{1F536}',
    items: [
      { id: 'CIRCLE', name: 'CIRCLE', icon: '\u{2B55}', fact: 'A circle is perfectly round with no corners!', q: 'Draw a circle in the air with your finger!', chain: 'Wheels, coins, and the sun are all circles!' },
      { id: 'SQUARE', name: 'SQUARE', icon: '\u{1F7E7}', fact: 'A square has four equal sides and four corners!', q: 'Find something square in the room!', chain: 'A chessboard is made of 64 tiny squares!' },
      { id: 'TRIANGLE', name: 'TRIANGLE', icon: '\u{1F53A}', fact: 'A triangle has three sides and three corners!', q: 'Make a triangle with your fingers!', chain: 'The pyramids in Egypt are giant triangles!' },
      { id: 'STAR', name: 'STAR', icon: '\u{2B50}', fact: 'Stars have pointy tips that shine bright!', q: 'Can you draw a star in the air?', chain: 'There are more stars in the sky than grains of sand on Earth!' },
      { id: 'HEART', name: 'HEART', icon: '\u{2764}\u{FE0F}', fact: 'A heart shape means love and caring!', q: 'Make a heart shape with your hands!', chain: 'Your real heart beats 100,000 times every day!' },
      { id: 'DIAMOND', name: 'DIAMOND', icon: '\u{1F537}', fact: 'A diamond is a square turned on its side!', q: 'Tilt your head — does a square become a diamond?', chain: 'Real diamonds are the hardest thing on Earth!' },
      { id: 'RECTANGLE', name: 'RECTANGLE', icon: '\u{1F7E9}', fact: 'A rectangle has two long sides and two short sides!', q: 'Find something shaped like a rectangle!', chain: 'Your door, your book, and your phone are all rectangles!' },
      { id: 'OVAL', name: 'OVAL', icon: '\u{1F95A}', fact: 'An oval is like a stretched circle — like an egg!', q: 'Draw an oval in the air!', chain: 'A rugby ball and a mirror can be oval shaped!' }
    ]
  }
];

const ANIMALS = CATEGORIES[0].items;
