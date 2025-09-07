module.exports = {
  config: {
    name: "mathgame2",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    category: "game",
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID, threadID } = event;
    const maxlimit = 10;
    const mathTimeLimit = 10 * 60 * 60 * 1000; // 10 hours
    const currentTime = Date.now();
    let userData = await usersData.get(senderID);

    if (!userData.data.maths) {
      userData.data.maths = { count: 0, firstMath: currentTime };
    }

    const timeElapsed = currentTime - userData.data.maths.firstMath;
    if (timeElapsed >= mathTimeLimit) {
      userData.data.maths = { count: 0, firstMath: currentTime };
    }

    if (userData.data.maths.count >= maxlimit) {
      const timeLeft = mathTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return api.sendMessage(
        `❌ | You have reached your mathgame limit of ${maxlimit} attempts. Please try again in ${hoursLeft}h ${minutesLeft}m.`,
        threadID,
        event.messageID
      );
    }

    function generateMathProblem() {
      const num1 = Math.floor(Math.random() * 10) + 1;
      let num2 = Math.floor(Math.random() * 10) + 1;
      const operators = ['+', '-', '×', '÷'];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      let correctAnswer;

      if (operator === '÷') {
        while (num1 % num2 !== 0) {
          num2 = Math.floor(Math.random() * 9) + 1;
        }
        correctAnswer = num1 / num2;
      } else {
        switch (operator) {
          case '+': correctAnswer = num1 + num2; break;
          case '-': correctAnswer = num1 - num2; break;
          case '×': correctAnswer = num1 * num2; break;
        }
      }

      return { question: `${num1} ${operator} ${num2} = ?`, answer: correctAnswer };
    }

    const problem = generateMathProblem();
    const userName = userData.name || "Player";

    api.sendMessage(`╭‣ ${userName} 🎀\n╰‣ Solve this: ${problem.question}`, threadID, (err, info) => {
      if (err) return console.error(err);

      global.GoatBot.onReply.set(info.messageID, {
        commandName: "mathgame",
        messageID: info.messageID,
        author: senderID,
        threadID: threadID,
        correctAnswer: problem.answer
      });

      userData.data.maths.count += 1;
      usersData.set(senderID, userData);
    });
  },

  onReply: async function ({ api, event, usersData }) {
    const { senderID, body, threadID, messageReply } = event;

    const replyData = global.GoatBot.onReply.get(messageReply?.messageID);
    if (!replyData || replyData.commandName !== "mathgame") return;

    if (senderID !== replyData.author) {
      return api.sendMessage("❌ This is not your question to answer!", threadID);
    }

    const userAnswer = parseFloat(body.trim());
    const correctAnswer = replyData.correctAnswer;
    let userData = await usersData.get(senderID);

    const rewardCoins = 1000;
    const rewardExp = 25;
    const penaltyCoins = 500;
    const penaltyExp = 50;

    try {
      await api.unsendMessage(replyData.messageID);
    } catch (error) {
      console.error(error);
    }

    if (!isNaN(userAnswer)) {
      if (userAnswer === correctAnswer) {
        const correctMsg = `✅ | Correct answer!\nYou win ${rewardCoins} coins & ${rewardExp} EXP.`;
        api.sendMessage(correctMsg, threadID, event.messageID);

        await usersData.set(senderID, {
          money: userData.money + rewardCoins,
          exp: userData.exp + rewardExp,
          data: userData.data,
        });
      } else {
        const wrongMsg = `❌ | Wrong answer!\nYou lost ${penaltyCoins} coins & ${penaltyExp} EXP.\nThe correct answer was: ${correctAnswer}`;
        api.sendMessage(wrongMsg, threadID, event.messageID);

        await usersData.set(senderID, {
          money: Math.max(userData.money - penaltyCoins, 0),
          exp: Math.max(userData.exp - penaltyExp, 0),
          data: userData.data,
        });
      }
    } else {
      api.sendMessage("⚠ Please send a valid number.", threadID);
    }

    global.GoatBot.onReply.delete(replyData.messageID);
  },
};
