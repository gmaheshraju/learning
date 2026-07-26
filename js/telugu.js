const TELUGU = {
  // Animals
  DOG: 'కుక్క', CAT: 'పిల్లి', ELEPHANT: 'ఏనుగు', LION: 'సింహం',
  RABBIT: 'కుందేలు', FISH: 'చేప', BIRD: 'పక్షి', MONKEY: 'కోతి',
  FROG: 'కప్ప', BUTTERFLY: 'సీతాకోకచిలుక', TURTLE: 'తాబేలు', PARROT: 'చిలుక',
  PENGUIN: 'పెంగ్విన్', GIRAFFE: 'జిరాఫీ', OWL: 'గుడ్లగూబ',

  // Fruits
  APPLE: 'ఆపిల్', BANANA: 'అరటి', ORANGE_FRUIT: 'నారింజ', GRAPES: 'ద్రాక్ష',
  WATERMELON: 'పుచ్చకాయ', STRAWBERRY: 'స్ట్రాబెర్రీ', MANGO: 'మామిడి', CHERRY: 'చెర్రీ',

  // Vegetables
  CARROT: 'క్యారెట్', TOMATO: 'టమాటా', BROCCOLI: 'బ్రొకోలీ', CORN: 'మొక్కజొన్న',
  POTATO: 'బంగాళాదుంప', ONION: 'ఉల్లిపాయ', PUMPKIN: 'గుమ్మడికాయ', CUCUMBER: 'దోసకాయ',

  // Kitchen
  CUP: 'కప్పు', PLATE: 'ప్లేటు', SPOON: 'చెంచా', FORK: 'ఫోర్క్',
  BOWL: 'గిన్నె', POT: 'కుండ', PAN: 'బాణలి', GLASS: 'గ్లాసు',

  // House
  CHAIR: 'కుర్చీ', TABLE: 'బల్ల', BED: 'మంచం', DOOR: 'తలుపు',
  WINDOW: 'కిటికీ', LAMP: 'దీపం', CLOCK: 'గడియారం', FAN: 'ఫ్యాన్',

  // Vehicles
  CAR: 'కారు', BUS: 'బస్సు', TRUCK: 'లారీ', BIKE: 'బైకు',
  TRAIN: 'రైలు', BOAT: 'పడవ', PLANE: 'విమానం', ROCKET: 'రాకెట్',

  // Colors
  CLR_RED: 'ఎరుపు', CLR_BLUE: 'నీలం', CLR_GREEN: 'ఆకుపచ్చ', CLR_YELLOW: 'పసుపు',
  CLR_PURPLE: 'ఊదా', CLR_PINK: 'గులాబీ', CLR_BROWN: 'గోధుమ', CLR_WHITE: 'తెలుపు',

  // Body Parts
  EYES: 'కళ్ళు', NOSE: 'ముక్కు', HAND: 'చేయి', EAR: 'చెవి',
  TEETH: 'పళ్ళు', HAIR: 'జుట్టు', FOOT: 'పాదం', TONGUE: 'నాలుక',

  // Clothes
  SHIRT: 'చొక్కా', PANTS: 'ప్యాంటు', SHOES: 'బూట్లు', HAT: 'టోపీ',
  SOCKS: 'సాక్సులు', DRESS: 'గౌను', JACKET: 'జాకెట్', SCARF: 'కండువా',

  // Numbers
  NUM_1: 'ఒకటి', NUM_2: 'రెండు', NUM_3: 'మూడు', NUM_4: 'నాలుగు',
  NUM_5: 'ఐదు', NUM_6: 'ఆరు', NUM_7: 'ఏడు', NUM_8: 'ఎనిమిది',

  // Shapes
  CIRCLE: 'వృత్తం', SQUARE: 'చతురస్రం', TRIANGLE: 'త్రికోణం', STAR: 'నక్షత్రం',
  HEART: 'హృదయం', DIAMOND: 'వజ్రం', RECTANGLE: 'దీర్ఘచతురస్రం', OVAL: 'అండాకారం'
};

const SENTENCES = {
  DOG: ['This is a Dog', 'The dog says Bow Wow!', 'Dogs love to play fetch'],
  CAT: ['This is a Cat', 'The cat says Meow!', 'Cats love to drink milk'],
  ELEPHANT: ['This is an Elephant', 'Elephants are very big!', 'Elephants spray water with their trunk'],
  LION: ['This is a Lion', 'The lion says Roar!', 'Lions live in the jungle'],
  RABBIT: ['This is a Rabbit', 'Rabbits love carrots!', 'Rabbits hop hop hop'],
  FISH: ['This is a Fish', 'Fish live in water', 'Fish swim very fast'],
  BIRD: ['This is a Bird', 'Birds can fly high!', 'Birds sing beautiful songs'],
  MONKEY: ['This is a Monkey', 'Monkeys love bananas!', 'Monkeys climb trees'],
  FROG: ['This is a Frog', 'The frog says Ribbit!', 'Frogs jump very high'],
  BUTTERFLY: ['This is a Butterfly', 'Butterflies have colorful wings', 'Butterflies fly from flower to flower'],
  TURTLE: ['This is a Turtle', 'Turtles walk very slowly', 'Turtles carry a shell on their back'],
  PARROT: ['This is a Parrot', 'Parrots can talk like us!', 'Parrots have colorful feathers'],
  PENGUIN: ['This is a Penguin', 'Penguins live in the cold', 'Penguins waddle when they walk'],
  GIRAFFE: ['This is a Giraffe', 'Giraffes have a very long neck', 'Giraffes eat leaves from tall trees'],
  OWL: ['This is an Owl', 'The owl says Hoo Hoo!', 'Owls can see in the dark'],

  APPLE: ['This is an Apple', 'Apples are red and sweet', 'One apple a day keeps the doctor away'],
  BANANA: ['This is a Banana', 'Bananas are yellow', 'Peel the banana before eating'],
  ORANGE_FRUIT: ['This is an Orange', 'Oranges are round and juicy', 'Orange juice is yummy!'],
  GRAPES: ['These are Grapes', 'Grapes grow in bunches', 'Grapes can be green or purple'],
  WATERMELON: ['This is a Watermelon', 'Watermelons are big and green', 'Watermelons are full of water'],
  STRAWBERRY: ['This is a Strawberry', 'Strawberries are small and red', 'Strawberries taste sweet'],
  MANGO: ['This is a Mango', 'Mangoes are the king of fruits!', 'Mangoes are yellow and sweet'],
  CHERRY: ['This is a Cherry', 'Cherries are tiny and red', 'Cherries grow on trees'],

  CARROT: ['This is a Carrot', 'Carrots are orange', 'Rabbits love to eat carrots'],
  TOMATO: ['This is a Tomato', 'Tomatoes are red and round', 'We make ketchup from tomatoes'],
  BROCCOLI: ['This is Broccoli', 'Broccoli looks like a little tree', 'Broccoli is very healthy'],
  CORN: ['This is Corn', 'Corn is yellow', 'We make popcorn from corn!'],
  POTATO: ['This is a Potato', 'Potatoes grow under the ground', 'We make french fries from potatoes'],
  ONION: ['This is an Onion', 'Onions make us cry!', 'Onions are used in cooking'],
  PUMPKIN: ['This is a Pumpkin', 'Pumpkins are big and orange', 'We carve pumpkins on Halloween'],
  CUCUMBER: ['This is a Cucumber', 'Cucumbers are green and crunchy', 'Cucumbers have lots of water'],

  CUP: ['This is a Cup', 'We drink water from a cup', 'Hold the cup with both hands'],
  PLATE: ['This is a Plate', 'We eat food from a plate', 'Put the plate on the table'],
  SPOON: ['This is a Spoon', 'We eat rice with a spoon', 'Hold the spoon in your hand'],
  FORK: ['This is a Fork', 'A fork has pointy teeth', 'We pick food with a fork'],
  BOWL: ['This is a Bowl', 'We eat soup from a bowl', 'The bowl is round and deep'],
  POT: ['This is a Pot', 'We cook food in a pot', 'The pot gets very hot'],
  PAN: ['This is a Pan', 'We fry food in a pan', 'Be careful, the pan is hot!'],
  GLASS: ['This is a Glass', 'We drink juice from a glass', 'Do not break the glass'],

  CHAIR: ['This is a Chair', 'We sit on a chair', 'Push the chair under the table'],
  TABLE: ['This is a Table', 'We eat on the table', 'The table has four legs'],
  BED: ['This is a Bed', 'We sleep on the bed', 'Make your bed every morning'],
  DOOR: ['This is a Door', 'Open the door please!', 'Close the door gently'],
  WINDOW: ['This is a Window', 'We look outside through the window', 'Open the window for fresh air'],
  LAMP: ['This is a Lamp', 'The lamp gives us light', 'Turn on the lamp when it is dark'],
  CLOCK: ['This is a Clock', 'The clock shows the time', 'Tick tock says the clock'],
  FAN: ['This is a Fan', 'The fan gives us cool air', 'Turn on the fan when it is hot'],

  CAR: ['This is a Car', 'Cars drive on the road', 'Beep beep says the car'],
  BUS: ['This is a Bus', 'Many people ride the bus', 'The bus is big and long'],
  TRUCK: ['This is a Truck', 'Trucks carry heavy things', 'Trucks are very big'],
  BIKE: ['This is a Bike', 'We ride a bike with two wheels', 'Wear a helmet on your bike'],
  TRAIN: ['This is a Train', 'Trains run on tracks', 'Choo choo says the train'],
  BOAT: ['This is a Boat', 'Boats float on water', 'Boats take us across the river'],
  PLANE: ['This is a Plane', 'Planes fly in the sky', 'Planes take us to far places'],
  ROCKET: ['This is a Rocket', 'Rockets go to space!', 'Three two one blast off!'],

  CLR_RED: ['This is Red', 'Apples are red', 'Red means stop!'],
  CLR_BLUE: ['This is Blue', 'The sky is blue', 'The ocean is also blue'],
  CLR_GREEN: ['This is Green', 'Leaves are green', 'Green means go!'],
  CLR_YELLOW: ['This is Yellow', 'The sun is yellow', 'Bananas are yellow too'],
  CLR_PURPLE: ['This is Purple', 'Grapes are purple', 'Purple is a royal color'],
  CLR_PINK: ['This is Pink', 'Flamingos are pink', 'Pink flowers smell nice'],
  CLR_BROWN: ['This is Brown', 'Chocolate is brown', 'Bears are brown'],
  CLR_WHITE: ['This is White', 'Snow is white', 'Clouds are white and fluffy'],

  EYES: ['These are Eyes', 'We see with our eyes', 'Blink your eyes!'],
  NOSE: ['This is a Nose', 'We smell with our nose', 'Touch your nose!'],
  HAND: ['This is a Hand', 'We have two hands', 'Clap your hands!'],
  EAR: ['This is an Ear', 'We hear with our ears', 'Touch your ear!'],
  TEETH: ['These are Teeth', 'We chew food with our teeth', 'Brush your teeth every day'],
  HAIR: ['This is Hair', 'Hair grows on our head', 'Comb your hair nicely'],
  FOOT: ['This is a Foot', 'We walk with our feet', 'Stamp your foot!'],
  TONGUE: ['This is a Tongue', 'We taste food with our tongue', 'Stick out your tongue!'],

  SHIRT: ['This is a Shirt', 'We wear a shirt on top', 'Button your shirt nicely'],
  PANTS: ['These are Pants', 'We wear pants on our legs', 'Put on your pants'],
  SHOES: ['These are Shoes', 'We wear shoes on our feet', 'Tie your shoe laces'],
  HAT: ['This is a Hat', 'We wear a hat on our head', 'The hat keeps the sun away'],
  SOCKS: ['These are Socks', 'We wear socks inside our shoes', 'Socks keep our feet warm'],
  DRESS: ['This is a Dress', 'Girls wear pretty dresses', 'This dress is beautiful'],
  JACKET: ['This is a Jacket', 'We wear a jacket when it is cold', 'Zip up your jacket'],
  SCARF: ['This is a Scarf', 'We wrap a scarf around our neck', 'The scarf keeps us warm'],

  NUM_1: ['This is number One', 'One sun in the sky', 'Show me one finger'],
  NUM_2: ['This is number Two', 'Two eyes to see', 'Show me two fingers'],
  NUM_3: ['This is number Three', 'Three wheels on a tricycle', 'Show me three fingers'],
  NUM_4: ['This is number Four', 'Four legs on a dog', 'Show me four fingers'],
  NUM_5: ['This is number Five', 'Five fingers on one hand', 'High five!'],
  NUM_6: ['This is number Six', 'Six legs on an insect', 'Show me six fingers'],
  NUM_7: ['This is number Seven', 'Seven colors in a rainbow', 'Show me seven fingers'],
  NUM_8: ['This is number Eight', 'Eight legs on an octopus', 'Show me eight fingers'],

  CIRCLE: ['This is a Circle', 'A circle is round like a ball', 'Draw a circle in the air'],
  SQUARE: ['This is a Square', 'A square has four equal sides', 'A window looks like a square'],
  TRIANGLE: ['This is a Triangle', 'A triangle has three sides', 'A roof looks like a triangle'],
  STAR: ['This is a Star', 'Stars shine at night', 'Draw a star with five points'],
  HEART: ['This is a Heart', 'A heart means love', 'I love you with all my heart'],
  DIAMOND: ['This is a Diamond', 'A diamond has four pointy sides', 'Diamonds sparkle and shine'],
  RECTANGLE: ['This is a Rectangle', 'A rectangle is like a long square', 'A door looks like a rectangle'],
  OVAL: ['This is an Oval', 'An oval is like a stretched circle', 'An egg is oval shaped']
};
