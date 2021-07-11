"use strict";
import joplin from "api";
import { SettingItemType } from "api/types";

const express = require("express");
const app = express();

joplin.plugins.register({
  onStart: async function() {
    // Settings
    await joplin.settings.registerSection("sendAction", {
      label: "Send action plugin settings",
      iconName: "fas fa-edit"
    });

    // Settings
    await joplin.settings.registerSetting("pluginPort", {
      value: 41185,
      type: SettingItemType.Int,
      section: "sendAction",
      label: "Plugin port",
      minimum: 10000,
      public: true,
      description: "The port the plugin will listen on"
    });

    await joplin.settings.registerSetting("openNotePath", {
      value: `/notes/open/:noteId`,
      type: SettingItemType.String,
      section: "sendAction",
      label: "Path string to open a note",
      public: true,
      description: "default: /notes/open/:noteId"
    });

    const pluginPort = await joplin.settings.value("pluginPort");
    app.listen(pluginPort);
    const openNotePath = await joplin.settings.value("openNotePath");
    app.get(openNotePath, async (req, res) => {
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
  }
});
