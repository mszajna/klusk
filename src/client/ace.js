export const fileContent = data$ => data$
  .filter(({type}) => type === 'file/content')

export const fileOverriden = data$ => data$
  .filter(({type}) => type === 'file/overriden')
