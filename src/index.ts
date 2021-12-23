"use strict";
import joplin from "api";
import { SettingItemType } from "api/types";

const express = require("express");
const app = express();

joplin.plugins.register({
  onStart: async function() {
    // Settings
    await joplin.settings.registerSection("sendAction", {
      label: "Send Action",
      iconName: "fas fa-edit"
    });

    // Settings
    joplin.settings.registerSettings({'pluginPort' : {
      value: 42420,
      type: SettingItemType.Int,
      section: "sendAction",
      label: "Plugin port",
      minimum: 42000,
      public: true,
      description: "The port to listen on (must restart on change)"
    }});

  
    initPlugin();
    await joplin.settings.onChange(() => {
    app.close();
      initPlugin();
    });
  }
});

async function initPlugin() {
  const pluginPort = await joplin.settings.value("pluginPort");
  app.listen(pluginPort);
  app.get("/notes/open/:noteId", async (req, res) => {
    await joplin.data
      .get(["notes", req.params.noteId], { field: ["id"] })
      .then(async note => {
        res.send("200");
        await joplin.commands.execute("openNote", note.id);
      })
      .catch(e => {
        res.send("404");
      });
  });

  app.get("/notes/create", async (req, res) => {
        const genRanHex = size => [...Array(size)]
        .map(() => Math.floor(Math.random() * 16)
          .toString(16)).join('');
        const noteId = genRanHex(32);
         /* await joplin.data
        .get(["notes", noteId], { field: ["id"] })*/
        const note = {
          id: noteId,
          body:req.query.noteBody,
          title:req.query.noteTitle,
          parent_id:req.query.folderId,
        }
        await joplin.data.post(['notes'], null, note).then(async note => {
        console.log(note);
        await joplin.commands.execute("openNote", noteId);
        res.send("200");

      }).catch(e => {
        res.send("404");
        console.error(e)
      });;
});

}

