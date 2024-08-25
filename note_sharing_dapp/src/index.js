const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

function hex2Object(hex) {
  const utf8String = ethers.toUtf8String(hex);
  return JSON.parse(utf8String);
}

function obj2Hex(obj) {
  const jsonString = JSON.stringify(obj);
  return ethers.hexlify(ethers.toUtf8Bytes(jsonString));
}

// Data storage
let notes = [];

// Function to handle advance state requests
async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const metadata = data['metadata'];
  const sender = metadata['msg_sender'];
  const payload = data['payload'];

  let request = hex2Object(payload);

  if (!request.noteId || !request.action || !request.details) {
    const report_req = await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: obj2Hex("Invalid note format") }),
    });

    return "reject";
  }

  // Handle note actions
  if (request.action === "create") {
    notes.push({
      id: request.noteId,
      content: request.details.content,
      author: sender,
      sharedWith: request.details.sharedWith || []
    });
  } else if (request.action === "update") {
    const note = notes.find(note => note.id === request.noteId);
    if (note && note.author === sender) {
      note.content = request.details.content || note.content;
      note.sharedWith = request.details.sharedWith || note.sharedWith;
    }
  }

  const notice_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: obj2Hex({ message: "Note updated" }) }),
  });

  return "accept";
}

// Function to handle inspection requests
async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data['payload'];
  const route = ethers.toUtf8String(payload);

  let responseObject = {};
  if (route === "notes") {
    responseObject = JSON.stringify({ notes });
  } else if (route.startsWith("note/")) {
    const noteId = route.split("/")[1];
    const note = notes.find(note => note.id === noteId);
    responseObject = note ? JSON.stringify(note) : "Note not found";
  } else {
    responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: obj2Hex(responseObject) }),
  });

  return "accept";
}

const handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

const finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      const handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
