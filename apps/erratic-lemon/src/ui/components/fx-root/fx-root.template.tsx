// eslint-disable-next-line @typescript-eslint/no-unused-vars
import JSX from "../../index";
import { FxRootComponent } from './fx-root.component';


export function template({name, numbers}: FxRootComponent) {
  return (
    <div className="asd">
      Hello {name}
      {numbers.map((i) => {
        debugger;
        return (<div> Hello Nested {i.a}</div>)
      })}
    </div>
  );
}

