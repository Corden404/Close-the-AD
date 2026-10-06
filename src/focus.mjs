// Restore exact controls across whole-view rerenders. Action names are not identities.
export function captureFocus(element){return element?.dataset?.focus||null;}
export function restoreFocus(root,identity,fallbacks=[]){
  for(const key of [...new Set([identity,...fallbacks].filter(Boolean))]){
    // Identifiers are authored locally, never derived from user input.
    const element=root.querySelector(`[data-focus="${key}"]`);
    if(element&&!element.disabled&&!element.hidden&&element.getClientRects().length){
      element.focus({preventScroll:true});
      return true;
    }
  }
  return false;
}
