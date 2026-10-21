export default {
  content: [
    // Anything in this app
    "./src/**/*.{js,ts,jsx,tsx}",

    // Make sure to include the UI package since we're not transpiling.
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
