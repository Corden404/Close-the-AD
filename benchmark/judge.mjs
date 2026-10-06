/** Private evaluator; never import this into the model-facing observation. */
export function evaluateState(state, stage) {
  const terminal=state.stage===stage&&state.completed.includes(stage)&&['debrief','complete'].includes(state.screen);
  const conditions=[
    state.recipeExpanded===true,
    state.saved===true,
    state.reviewed===true&&!state.extras.insurance&&!state.extras.fast&&!state.extras.trial,
    state.lessonOpened===true,
    state.pushAllowed===false&&state.messageRead===true,
    state.subscription.status==='cancelled'&&state.subscription.renewal===false&&state.subscription.nextCharge===null
  ];
  const success=terminal&&conditions[stage]===true;
  return {stage:stage+1,success,zero_mistake_success:success&&state.mistakes===0,mistakes:state.mistakes,recoveries:state.recoveries,inspected_controls:state.inspected.length};
}
