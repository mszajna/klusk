import {assign, update, pick, keys, intersection} from 'lodash/fp'

const updateListing = newListing => oldListing => {
  const retainedFiles = intersection(keys(oldListing), keys(newListing))
  return assign(newListing, pick(oldListing, retainedFiles))
}

const filePathToObjectPath = path => path.replace('/', '.files.') + '.files'

export const directoryListing = data$ => data$
  .filter(({type}) => type === 'dir/list')
  .scan((dir, {path, files}) => path === '.'
    ? updateListing(files)(dir)
    : update(filePathToObjectPath(path), updateListing(files))(dir), {})
