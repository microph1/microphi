# @microphi/flux errors

Every error flux throws is a `FluxError`: `error.code` is one of the codes below, and the message starts with the code and ends with a link here.

## FLUX001

**An event binding calls a method that does not exist.**

`(click)="save()"` looks `save` up on the component's controller, then on its parent controller (inside `fx-for`).

Fix: check the method name in the template and that it is a method of the component class.

## FLUX002

**A `[[property]]` binding targets an element with no controller.**

`[[prop]]` sets an input on a child component; the child element exists but its component was never registered, so it has no controller.

Fix: import the child component (its module must run, so its `@Component` registers the custom element) before the parent renders.
