import Form from "@rjsf/core";
import { useEffect, useState } from "react";
import { parse, stringify } from "css";
import _ from "lodash";

const Main = () => {
  const [formSchema, setFormSchema] = useState();

  const schema = {
    required: ["title"],
    properties: {
      title: { type: "string", title: "Title", default: "A new task" },
      done: { type: "boolean", title: "Done?", default: false },
    },
  };

  const titleItem = (mainPrincipal, firstItem) => {
    return mainPrincipal.filter(
      (titleItem) => titleItem !== firstItem && titleItem.length > 0
    )[0];
  };

  const loadData = () => {
    fetch("/cscscs.css")
      .then((fetchResponse) => {
        if (!fetchResponse.ok) {
          throw new Error("Not 2xx response");
        }

        return fetchResponse.text();
      })
      .then((cssText) => {
        // TODO check invalid css
        const parsedObject = parse(cssText);
        if (
          parsedObject == null ||
          parsedObject.type !== "stylesheet" ||
          (parsedObject.parsingErrors != null &&
            parsedObject.parsingErrors.length > 0)
        ) {
          throw new Error("Stylesheet has errors");
        }

        const sheetRules = parsedObject.stylesheet.rules.filter(
          (mapItem) => mapItem.type === "rule"
        );

        if (
          sheetRules.filter((actualItem) => actualItem.selectors.length > 1)
            .length > 0
        ) {
          throw new Error(
            "Stylesheet rule hasn't single element in the `selectors` array"
          );
        }

        const properties = sheetRules.map((actualItem) => {
          const finalValue = {};
          const primarySelector = actualItem.selectors[0];
          const mainPrincipal = primarySelector.split(".");

          if (mainPrincipal.length < 3) {
            throw new Error("Invalid principal length");
          }

          if (
            mainPrincipal.filter((titleItem) => titleItem === "string").length >
            0
          ) {
            const itemType = "string";
            finalValue.type = itemType;
            finalValue.title = titleItem(mainPrincipal, itemType);
          } else if (
            mainPrincipal.filter((titleItem) => titleItem === "data-url")
              .length > 0
          ) {
            const itemType = "data-url";
            finalValue.type = "string";
            finalValue.format = itemType;
            finalValue.title = titleItem(mainPrincipal, itemType);
          } else if (
            mainPrincipal.filter((titleItem) => titleItem === "boolean")
              .length > 0
          ) {
            const itemType = "boolean";
            finalValue.type = itemType;
            finalValue.title = titleItem(mainPrincipal, itemType);
          } else {
            throw new Error("Invalid principal type");
          }

          return finalValue;
        });

        setFormSchema({ properties });
        console.log(
          "sdfsdfsdf",
          properties,
          parsedObject,
          stringify(parsedObject, { compress: true })
        );
      })
      .catch(console.error);
  };

  useEffect(loadData, []);

  return (
    <>
      {formSchema != null && (
        <Form
          schema={formSchema}
          onChange={(x) => console.log(x)}
          onSubmit={(x) => console.log(x)}
          onError={(x) => console.log(x)}
        />
      )}
    </>
  );
};

export default Main;
