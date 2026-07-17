const PAIR_COLORS = ['#E85D75', '#F5A623', '#4DADEA', '#7EC850'];
const BG_LIGHT = ['#FCCDD5', '#FDE4B0', '#B8DDFB', '#C8EDB3'];
const BG_DARK = ['#5A2030', '#5A4018', '#1A3A5A', '#1E4A20'];

const CATEGORIES = [
  {
    id: 'animals', name: 'Animals', emoji: '\u{1F43E}',
    items: [
      { id: 'DOG', name: 'DOG', fact: 'Dogs wag their tail when happy!', q: 'Can you wag like a dog?', chain: 'Dogs have wet noses to smell better. Can YOU smell your food before eating?' },
      { id: 'CAT', name: 'CAT', fact: 'Cats sleep for 16 hours every day!', q: 'How many hours do YOU sleep?', chain: 'Cats can see in the dark! Their eyes glow at night.' },
      { id: 'ELEPHANT', name: 'ELEPHANT', fact: 'Elephants are the biggest land animals!', q: 'Walk heavy like an elephant!', chain: 'Baby elephants suck their trunk like babies suck their thumb!' },
      { id: 'LION', name: 'LION', fact: 'Lions are called King of the Jungle!', q: 'Can you ROAR like a lion?', chain: 'Only boy lions have the big mane. Girl lions do the hunting!' },
      { id: 'RABBIT', name: 'RABBIT', fact: 'Rabbits hop with strong back legs!', q: 'How many jumps can YOU do?', chain: 'Rabbits eat carrots and veggies. What veggies do YOU like?' },
      { id: 'FISH', name: 'FISH', fact: 'Fish breathe underwater using gills!', q: 'Can YOU breathe underwater?', chain: 'Fish sleep with eyes open — no eyelids! Could you sleep like that?' },
      { id: 'BIRD', name: 'BIRD', fact: 'Birds are the only animals with feathers!', q: 'Flap your arms like a bird!', chain: 'Some birds fly higher than airplanes!' },
      { id: 'MONKEY', name: 'MONKEY', fact: 'Monkeys love eating bananas!', q: 'What is YOUR favorite fruit?', chain: 'Monkeys laugh and tickle each other just like us!' },
      { id: 'FROG', name: 'FROG', fact: 'Frogs jump 20 times their own size!', q: 'Jump like a frog! Ribbit!', chain: 'Frogs start as tiny tadpoles then grow legs! Like magic!' },
      { id: 'BUTTERFLY', name: 'BUTTERFLY', fact: 'Butterflies start as caterpillars!', q: 'Name the colors of a butterfly!', chain: 'A caterpillar wraps in a cocoon and becomes a butterfly!' },
      { id: 'TURTLE', name: 'TURTLE', fact: 'Turtles carry their home on their back!', q: 'What would YOU keep in a shell?', chain: 'Some turtles live for 100 years! Older than grandma!' },
      { id: 'PARROT', name: 'PARROT', fact: 'Parrots can learn to talk like us!', q: 'What would you teach a parrot?', chain: 'Parrots come in every rainbow color!' },
      { id: 'PENGUIN', name: 'PENGUIN', fact: 'Penguins swim fast but cannot fly!', q: 'Waddle like a penguin!', chain: 'Penguin daddies keep the egg warm on their feet!' },
      { id: 'GIRAFFE', name: 'GIRAFFE', fact: 'Giraffes are the tallest animals!', q: 'Stretch tall like a giraffe!', chain: "Giraffe tongue is purple and super long!" },
      { id: 'OWL', name: 'OWL', fact: 'Owls can see in the dark!', q: 'What do owls say? Hoo hoo!', chain: 'Owls turn their head almost all the way around!' }
    ]
  },
  {
    id: 'fruits', name: 'Fruits', emoji: '\u{1F34E}',
    items: [
      { id: 'APPLE', name: 'APPLE', fact: 'Apples can be red, green, or yellow!', q: 'What color apple do you like best?', chain: 'There are over 7,500 types of apples in the world!' },
      { id: 'BANANA', name: 'BANANA', fact: 'Bananas grow in big bunches on tall plants!', q: 'Can you peel a banana yourself?', chain: 'Bananas are curved because they grow towards the sun!' },
      { id: 'ORANGE_FRUIT', name: 'ORANGE', fact: 'Oranges are full of juice inside!', q: 'Can you squeeze your hands like an orange?', chain: 'The color orange was named after the fruit!' },
      { id: 'GRAPES', name: 'GRAPES', fact: 'Grapes grow on long vines in the sunshine!', q: 'Can you pick pretend grapes above you?', chain: 'It takes about 75 grapes to make one glass of juice!' },
      { id: 'WATERMELON', name: 'WATERMELON', fact: 'Watermelons are mostly water inside!', q: 'Is watermelon bigger than your head?', chain: 'The biggest watermelon ever weighed as much as a person!' },
      { id: 'STRAWBERRY', name: 'STRAWBERRY', fact: 'Strawberries have tiny seeds on the outside!', q: 'Can you count dots on a strawberry?', chain: 'Strawberries are the only fruit with seeds on the outside!' },
      { id: 'MANGO', name: 'MANGO', fact: 'Mangoes are sweet and come from warm places!', q: 'Can you find something yellow and orange?', chain: 'Mango is the most eaten fruit in the whole world!' },
      { id: 'CHERRY', name: 'CHERRY', fact: 'Cherries grow in pairs like best friends!', q: 'Can you hold two things like cherry twins?', chain: 'Cherry trees grow beautiful pink flowers in spring!' }
    ]
  },
  {
    id: 'vegetables', name: 'Vegetables', emoji: '\u{1F955}',
    items: [
      { id: 'CARROT', name: 'CARROT', fact: 'Carrots grow underground — you pull them out!', q: 'Pretend to pull a carrot from the ground!', chain: 'Carrots were originally purple! Orange ones came later.' },
      { id: 'TOMATO', name: 'TOMATO', fact: 'Tomatoes are red, round, and juicy!', q: 'Is a tomato a fruit or veggie? It is a fruit!', chain: 'There are over 10,000 types of tomatoes!' },
      { id: 'BROCCOLI', name: 'BROCCOLI', fact: 'Broccoli looks like a tiny tree you can eat!', q: 'Pretend to be a broccoli tree! Stand tall!', chain: 'Broccoli has more vitamin C than an orange!' },
      { id: 'CORN', name: 'CORN', fact: 'Corn grows on tall stalks taller than you!', q: 'Can you reach up high like a corn stalk?', chain: 'Each corn cob has about 800 kernels! So many.' },
      { id: 'POTATO', name: 'POTATO', fact: 'Potatoes grow underground like hidden treasure!', q: 'Can you dig in pretend dirt for a potato?', chain: 'Potatoes were the first food grown in space!' },
      { id: 'ONION', name: 'ONION', fact: 'Onions have many layers inside like a ball!', q: 'Onions make people cry! Have you seen that?', chain: 'People have eaten onions for over 5,000 years!' },
      { id: 'PUMPKIN', name: 'PUMPKIN', fact: 'Pumpkins are big, round, and orange!', q: 'Make your arms round like a big pumpkin!', chain: 'The biggest pumpkin ever was as heavy as a small car!' },
      { id: 'CUCUMBER', name: 'CUCUMBER', fact: 'Cucumbers are cool and crunchy to eat!', q: 'Can you crunch like eating a cucumber?', chain: 'Cucumbers are 95% water! Almost all water.' }
    ]
  },
  {
    id: 'kitchen', name: 'Kitchen', emoji: '\u{1F373}',
    items: [
      { id: 'CUP', name: 'CUP', fact: 'We drink water and milk from cups!', q: 'Pretend to sip from a cup! Sip sip!', chain: 'The first cups were made from animal horns long ago!' },
      { id: 'PLATE', name: 'PLATE', fact: 'We eat our food from round plates!', q: 'What is your favorite food on a plate?', chain: 'In some places, people eat food on banana leaves!' },
      { id: 'SPOON', name: 'SPOON', fact: 'Spoons help us eat soup and rice!', q: 'Can you stir pretend soup? Round and round!', chain: 'Long ago people used shells as spoons!' },
      { id: 'FORK', name: 'FORK', fact: 'Forks have pointy tips to pick up food!', q: 'How many points does a fork have? Count!', chain: 'People used to eat only with their hands!' },
      { id: 'BOWL', name: 'BOWL', fact: 'Bowls hold soup, cereal, and yummy things!', q: 'Hold your hands like a bowl shape!', chain: 'The first bowls were made from clay!' },
      { id: 'POT', name: 'POT', fact: 'Pots cook hot food on the stove!', q: 'Stir a pretend pot! Round and round!', chain: 'Some pots can cook food using just the sun!' },
      { id: 'PAN', name: 'PAN', fact: 'Pans are flat for frying food!', q: 'Flip a pretend pancake in a pan! Flip!', chain: 'The biggest pan could cook 1,000 eggs at once!' },
      { id: 'GLASS', name: 'GLASS', fact: 'We drink juice from a see-through glass!', q: 'Can you see through a glass? Try it!', chain: 'Glass is made from sand! Hot sand turns into glass.' }
    ]
  },
  {
    id: 'house', name: 'House', emoji: '\u{1F3E0}',
    items: [
      { id: 'CHAIR', name: 'CHAIR', fact: 'Chairs have four legs for sitting!', q: 'Count the legs on a chair! How many?', chain: 'Long ago only kings had chairs! Others sat on the floor.' },
      { id: 'TABLE', name: 'TABLE', fact: 'We eat and draw on tables!', q: 'What do you like to do at the table?', chain: 'Some tables fold up tiny! Like magic.' },
      { id: 'BED', name: 'BED', fact: 'Beds are soft and cozy for sleeping!', q: 'Pretend to sleep! Close your eyes!', chain: 'Cats love sleeping on beds too! Just like you.' },
      { id: 'DOOR', name: 'DOOR', fact: 'Doors open and close to let us in!', q: 'Knock on a door! Knock knock knock!', chain: 'The oldest door is 5,000 years old and still works!' },
      { id: 'WINDOW', name: 'WINDOW', fact: 'Windows let sunshine come inside!', q: 'Look out a window! What do you see?', chain: 'Long ago windows had no glass! Just open holes.' },
      { id: 'LAMP', name: 'LAMP', fact: 'Lamps make light so we can see at night!', q: 'Turn a pretend lamp on and off! Click!', chain: 'Before lamps, people used candles and fire!' },
      { id: 'CLOCK', name: 'CLOCK', fact: 'Clocks tell us what time it is!', q: 'Go tick-tock like a clock!', chain: 'The first clocks used shadows from the sun!' },
      { id: 'FAN', name: 'FAN', fact: 'Fans spin round to make cool air!', q: 'Spin your arm around like a fan!', chain: 'The first fans were big leaves people waved!' }
    ]
  },
  {
    id: 'vehicles', name: 'Vehicles', emoji: '\u{1F697}',
    items: [
      { id: 'CAR', name: 'CAR', fact: 'Cars have four wheels to go places!', q: 'Hold a pretend steering wheel! Vroom!', chain: 'The first cars were slower than a bicycle!' },
      { id: 'BUS', name: 'BUS', fact: 'Buses are big and carry many people!', q: 'Wave to the bus driver! Hello!', chain: 'Some buses have two floors! You sit upstairs.' },
      { id: 'TRUCK', name: 'TRUCK', fact: 'Trucks carry heavy things everywhere!', q: 'Honk like a big truck! BEEP BEEP!', chain: 'The biggest trucks have wheels taller than people!' },
      { id: 'BIKE', name: 'BIKE', fact: 'Bikes have two wheels — you pedal to go!', q: 'Pedal your legs like riding a bike!', chain: 'More people ride bikes than drive cars in the world!' },
      { id: 'TRAIN', name: 'TRAIN', fact: 'Trains go on tracks! Choo choo!', q: 'Can you go choo-choo like a train?', chain: 'The fastest trains float on magnets!' },
      { id: 'BOAT', name: 'BOAT', fact: 'Boats float on water and sail with wind!', q: 'Rock side to side like a boat on waves!', chain: 'The biggest boats are longer than three football fields!' },
      { id: 'PLANE', name: 'PLANE', fact: 'Planes have wings and fly in the sky!', q: 'Spread your arms like airplane wings!', chain: 'Planes fly higher than the tallest mountain!' },
      { id: 'ROCKET', name: 'ROCKET', fact: 'Rockets blast off into space! 3, 2, 1!', q: 'Count down! 3, 2, 1 — Jump up!', chain: 'Astronauts float inside rockets in space!' }
    ]
  },
  {
    id: 'colors', name: 'Colors', emoji: '\u{1F3A8}',
    items: [
      { id: 'CLR_RED', name: 'RED', fact: 'Red is the color of apples and fire trucks!', q: 'Find something red near you right now!', chain: 'Red is the first color babies can see!' },
      { id: 'CLR_BLUE', name: 'BLUE', fact: 'Blue is the color of the sky and ocean!', q: 'Look up! Is the sky blue today?', chain: 'Blue is the world\'s most popular favorite color!' },
      { id: 'CLR_GREEN', name: 'GREEN', fact: 'Green is the color of grass and leaves!', q: 'Find something green! Trees are green!', chain: 'Your eyes can see more greens than any other color!' },
      { id: 'CLR_YELLOW', name: 'YELLOW', fact: 'Yellow is the color of the sun and bananas!', q: 'Draw a yellow sun in the air!', chain: 'Yellow is easiest to see far away! That is why taxis are yellow.' },
      { id: 'CLR_PURPLE', name: 'PURPLE', fact: 'Purple is made by mixing red and blue!', q: 'What two colors make purple?', chain: 'Long ago only kings could wear purple!' },
      { id: 'CLR_PINK', name: 'PINK', fact: 'Pink is a soft red — like a flower!', q: 'Can you name a pink flower?', chain: 'Flamingos are pink because they eat pink shrimp!' },
      { id: 'CLR_BROWN', name: 'BROWN', fact: 'Brown is the color of chocolate and trees!', q: 'Trees have brown trunks — hug a tree!', chain: 'You make brown by mixing all colors together!' },
      { id: 'CLR_WHITE', name: 'WHITE', fact: 'White is the color of snow and clouds!', q: 'Are the clouds white and fluffy today?', chain: 'White light has all rainbow colors hiding inside!' }
    ]
  }
];

const ANIMALS = CATEGORIES[0].items;
