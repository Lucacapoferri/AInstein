# AInstein



## How to run the front-end

Run:

cd EmailPreviewBrowser/
npm install
npm run dev

Base requirement:
node version == 20.19
npm  version == 10.8.2


const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          app_name: "greeting-agent",
          user_id: "u_123",
          session_id: "s_123", //session error its s_123
          new_message: {
            role: "user",
            parts: [{ text: "Hi" }]
          }
        })
      });
      //const res = await fetch(`http://localhost:8000/api/search?query=${encodeURIComponent(query)}`);
      console.log(res);
