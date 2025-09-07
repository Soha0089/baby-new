module.exports = {
    config: {
        name: "morse",
        version: "1.2",
        author: "RL",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Encode and decode Morse code."
        },
        description: {
            en: "This command encodes and decodes messages in Morse code."
        },
        category: "tools",
        guide: {
            en: "Use !morse <encode/decode> <message>"
        }
    },
    // Morse Code mapping (includes letters, numbers, and symbols)
    morseCode: {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 
        'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 
        'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 
        'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 
        'Z': '--..', '1': '.----', '2': '..---', '3': '...--', 
        '4': '....-', '5': '.....', '6': '-....', '7': '--...', 
        '8': '---..', '9': '----.', '0': '-----', 
        '!': '-.-.--', '@': '.--.-.', '&': '.-...', ':': '---...', 
        ';': '-.-.-.', ',': '--..--', '.': '.-.-.-', '?': '..--..', 
        '-': '-....-', '/': '-..-.', ' ': '/'
    },

    // Encoding function
    encode: function(message) {
        return message.split('').map(char => this.morseCode[char.toUpperCase()] || '').join(' ');
    },

    // Decoding function
    decode: function(morseMessage) {
        const reversedMorse = Object.fromEntries(Object.entries(this.morseCode).map(([k, v]) => [v, k]));
        return morseMessage.split(' ').map(code => reversedMorse[code] || '').join('');
    },

    onStart: async function ({ api, args, message }) {
        const action = args[0];
        const input = args.slice(1).join(' ');

        if (action === "encode") {
            const encodedMessage = this.encode(input);
            message.reply(`Encoded: ${encodedMessage}`);
        } else if (action === "decode") {
            const decodedMessage = this.decode(input);
            message.reply(`Decoded: ${decodedMessage}`);
        } else {
            message.reply("Please specify 'encode' or 'decode'.");
        }
    }
};
