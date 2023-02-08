import "@logseq/libs";
import type { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "language",
    type: "string",
    title: "Language to use for definitions",
    description: "What language do you want to default to when defining?",
    default: "en",
  },
];

const removeBrackets = /[\[\]]/g;
async function main() {
  logseq.Editor.registerSlashCommand("Define", async () => {
    const block = await logseq.Editor.getCurrentBlock();
    if (!block) {
      return;
    }
    let content = await logseq.Editor.getEditingBlockContent();
    content = content.replaceAll(removeBrackets, "");

    const lang = logseq.settings?.language ?? "en";
    try {
      const request = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${content}`
      );
      const result = await request.json();
      console.log(result);
      if (result.message) {
        throw new Error("word not found");
      }
      const firstAudio = result[0].phonetics.find((p: any) => p.audio);
      const phonetic = firstAudio
        ? {
          content: "phonetic",
          children: [
            {
              content: `${firstAudio.text}\n<audio controls><source src="${firstAudio.audio}"></audio>`,
            },
          ],
        }
        : {
          content: "phonetic",
          children: [
            {
              content: result[0].phonetic,
            },
          ],
        };
      const blocks = [phonetic].concat(
        result[0].meanings.map((meaning: any) => {
          return {
            content: meaning.partOfSpeech,
            children: meaning.definitions.map((def: any) => {
              return {
                content: def.definition,
                children: def.example ? [{
                  content: `*"${def.example}"*`,
                }] : [],
              };
            }),
          };
        })
      );
      await logseq.Editor.insertBatchBlock(block.uuid, blocks, {
        sibling: false,
      });
    } catch (err) {
      logseq.UI.showMsg(`error defining word ${content}: ${err}`, "error");
    }
  });
}

logseq.useSettingsSchema(settingsSchema);
logseq.ready(main).catch(() => console.error);
