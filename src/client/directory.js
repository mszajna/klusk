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
          [name]: directoryReducer(directory.files[name], {type, path: rest, fullPath: path, ...action})
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
      case 'file/open':
        if (name === '.') {
          return {
            ...directory,
            open: true
          }
        } else {
          return {
            ...directory,
            files: {
              ...directory.files,
              [name]: {...directory.files[name], open: true}
            }
          }
        }
      case 'file/close':
        if (name === '.') {
          return {
            ...directory,
            open: false
          }
        } else {
          return {
            ...directory,
            files: {
              ...directory.files,
              [name]: {...directory.files[name], open: false}
            }
          }
        }
      case 'file/created':
        return {
          ...directory,
          files: {
            ...directory.files,
            [name]: {path: action.fullPath || path, ...action}
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
  .scan(directoryReducer, initial)
  .startWith(initial)
