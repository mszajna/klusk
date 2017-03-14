import {assign, omit, pick, keys, intersection} from 'lodash/fp'

const updateListing = newListing => oldListing => {
  const retainedFiles = intersection(keys(oldListing), keys(newListing))
  return assign(newListing, pick(retainedFiles)(oldListing))
}

const directoryReducer = (directory, {type, path, ...action}) => {
  const [, name,, rest] = path.match(/^([^/]+)(\/(.*))?$/)
  if (rest) {
    if (directory.files[name]) {
      return {
        ...directory,
        files: {
          ...directory.files,
          [name]: directoryReducer(directory.files[name], {type, path: rest, ...action})
        }
      }
    } else {
      return directory
    }
  } else {
    switch (type) {
      case 'dir/list':
        if (name === '.') {
          return {
            ...directory,
            files: updateListing(action.files)(directory.files)
          }
        } else {
          return {
            ...directory,
            files: {
              ...directory.files,
              [name]: directoryReducer(directory.files[name], {type, path: '.', ...action})
            }
          }
        }
      case 'file/created':
        return {
          ...directory,
          files: {
            ...directory.files,
            [name]: {...action}
          }
        }
      case 'file/deleted':
        return {
          ...directory,
          files: omit(name, directory.files)
        }
      default:
        return directory
    }
  }
}

const initial = {files: {}}

export const directoryListing = data$ => data$
  .filter(({type}) => type === 'dir/list' || type === 'file/created' || type === 'file/deleted')
  .scan(directoryReducer, initial)
  .startWith(initial)
