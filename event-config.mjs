// ✏️ Edit this file to update the invitation and the dish list.
export const EVENT = {
  dateLabel: "Sunday, November 15th",
  date: "2026-11-15",
  // Mountain time, 24-hour format. Leave blank to show "Time coming soon".
  start: "15:00", // 3 PM
  end: "",     // e.g. "20:00"
  address: "6973 S Jackson Way, Centennial, CO 80122",
  hosts: "Caroline & Matt",
  // Allergies you already know about. Guests can add more when they RSVP.
  allergies: ["Onions"],
  note: "We've got the turkey covered. Grab a dish from the list below, or add your own!",

  hostDishes: [
    { name: "Turkey" },
    { name: "Gravy" },
    { name: "Dinner rolls" },
    { name: "Pink stuff", note: "raspberry Jell-O with Cool Whip" },
  ],

  // Suggested dishes guests can claim (one person each).
  suggestions: {
    "Sides": [
      "Mashed potatoes",
      "Stuffing",
      "Sweet potato casserole",
      "Green bean casserole",
      "Mac and cheese",
      "Roasted vegetables",
      "Cranberry sauce",
    ],
    "Salads & starters": [
      "Green salad",
      "Deviled eggs",
      "Cheese and cracker board",
      "Veggie tray with dip",
    ],
    "Desserts": [
      "Pumpkin pie",
      "Apple pie",
      "Pecan pie",
      "Whipped cream",
    ],
  },
};
