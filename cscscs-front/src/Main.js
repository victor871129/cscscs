import Form from "@rjsf/core";
import { useEffect } from "react";
import { parse, stringify } from "css";
import _ from 'lodash'

function Main() {
    const schema = {
        required: ["title"],
        properties: {
            title: { type: "string", title: "Title", default: "A new task" },
            done: { type: "boolean", title: "Done?", default: false }
        }
    };

    const loadData = () => {
        fetch('/cscscs.css')
            .then((fetchResponse) => {
                if (!fetchResponse.ok) {
                    throw new Error("Not 2xx response")
                }

                return fetchResponse.text();
            })
            .then(cssText => {
                // TODO check invalid css
                const parsedObject = parse(cssText);
                if (parsedObject == null || parsedObject.type !== 'stylesheet'
                    || parsedObject.parsingErrors != null && parsedObject.parsingErrors.length > 0) {
                    throw new Error("Stylesheet has errors")
                }

                const sheetRules = parsedObject.stylesheet.rules
                    .filter((mapItem) => mapItem.type === "rule")

                if (sheetRules.filter((actualItem) => actualItem.selectors.length > 1).length > 0) {
                    throw new Error("Stylesheet rule hasn't single element in the `selectors` array")
                }

                console.log("sdfsdfsdf", sheetRules, parsedObject, stringify(parsedObject, { compress: true }));
            })
            .catch(console.error);
    }

    useEffect(loadData, []);

    return (
        <Form schema={schema}
            onChange={(x) => console.log(x)}
            onSubmit={(x) => console.log(x)}
            onError={(x) => console.log(x)} />
    );
}

export default Main;