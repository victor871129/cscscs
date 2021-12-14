import Form from "@rjsf/core";
import { useEffect, useState } from "react";
import { parse, stringify } from "css";
import _ from "lodash";

const Main = () => {
  const [formSchema, setFormSchema] = useState();
  const [userSchema, setUserSchema] = useState();

  const schema = {
    required: ["title"],
    properties: {
      title: { type: "string", title: "Title", default: "A new task" },
      done: { type: "boolean", title: "Done?", default: false },
    },
  };

  const titleItem = (mainPrincipal, firstItem) => {
    return _.startCase(
      mainPrincipal.filter(
        (titleItem) => titleItem !== firstItem && titleItem.length > 0
      )[0]
    );
  };

  const defaultItem = (mainContent) => {
    const actualValue = mainContent[0].value;
    if (actualValue.charAt(0) === '"' || actualValue.charAt(0) === "'") {
      return actualValue.substring(1, actualValue.length - 1);
    }
    return actualValue;
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

        const userInterface = {};
        const actualProperties = sheetRules.map((actualItem) => {
          const finalValue = {}; // TODO rename to finalSchema
          const mainPrincipal = actualItem.selectors[0].split("."); // TODO rename to firstPrincipal
          const mainContent = actualItem.declarations.filter(
            (useItem) => useItem.property === "content"
          );

          if (mainPrincipal.length < 3) {
            throw new Error("Invalid principal length");
          }

          if (
            mainPrincipal.filter((useItem) => useItem === "string").length > 0
          ) {
            const itemType = "string";
            finalValue.type = itemType;
            finalValue.title = titleItem(mainPrincipal, itemType);

            if (mainContent.length > 0) {
              finalValue.default = defaultItem(mainContent);
            }
          } else if (
            mainPrincipal.filter((useItem) => useItem === "integer").length > 0
          ) {
            const itemType = "integer";
            finalValue.type = itemType;
            finalValue.title = titleItem(mainPrincipal, itemType);

            if (mainContent.length > 0) {
              finalValue.default = defaultItem(mainContent);
            }
          }

          //Other principal types
          else if (
            mainPrincipal.filter((titleItem) => titleItem === "boolean")
              .length > 0
          ) {
            const itemType = "boolean";
            finalValue.type = itemType;
            finalValue.title = titleItem(mainPrincipal, itemType);

            const isTrue = defaultItem(mainContent) === "true";
            if (mainContent.length > 0 && isTrue) {
              finalValue.default = true;
            }
          } else if (
            mainPrincipal.filter((titleItem) => titleItem === "data-url")
              .length > 0
          ) {
            const itemType = "data-url";
            finalValue.type = "string";
            finalValue.format = itemType;
            const yy = titleItem(mainPrincipal, itemType);
            finalValue.title = yy;

            if (mainContent.length > 0) {
              userInterface[yy] = {
                "ui:options": {
                  accept: defaultItem(mainContent),
                },
              };
            }
          } else {
            throw new Error("Invalid principal type");
          }

          return finalValue;
        });

        const properties = {};
        for (const actualValue of actualProperties) {
          properties[actualValue.title] = actualValue;
        }

        setFormSchema({ properties });
        setUserSchema(userInterface);
        console.log(
          userInterface,
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
          uiSchema={userSchema}
          onChange={(x) => console.log(x)}
          onSubmit={(x) => console.log(x)}
          onError={(x) => console.log(x)}
        />
      )}
    </>
  );
};

export default Main;
