/** @type {import('tailwindcss').Config} */
module.exports = {
  
   content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
       extend: {
       colors: {
        'myorange': '#FF8500',
        'mygray': '#DFCFF7',
         'myblue': '#0E47C8',

      },
       fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [

  ],
}

