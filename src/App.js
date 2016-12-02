import React, {Component} from 'react'
import Input from 'react-toolbox/lib/input'
import UrlParse from 'url-parse'
import copy from 'copy-to-clipboard'
import {parse as queryParse, stringify as queryStringify} from 'query-string'
import './style.scss'

const STORAGE_KEY = 'nametagsdata'
const storage = global.localStorage

const defaultConfig = {
  color: 'bestill',
  classic: 'pastrykbare',
  disney: 'disney',
  starwars: 'starwars',
  spiderman: 'spiderman',
  helloKitty: 'hello-kitty'
}

const config = {
  'www.navnelapper.no': Object.assign({}, defaultConfig, {
    color: 'bestill',
    classic: 'pastrykbare'
  }),
  'www.namnlappar.se': Object.assign({}, defaultConfig, {
    color: 'namnlappar',
    classic: 'strykbara-namnlappar',
    disney: 'disney-namnlappar',
    starwars: 'star-wars-namnlappar',
    spiderman: 'spider-man-namnlappar',
    helloKitty: 'hello-kitty-namnlappar'
  }),
  'www.identiketter.dk': Object.assign({}, defaultConfig, {
    color: 'navnemaerker',
    classic: 'strygbare-navnemaerker',
    disney: 'disney-navnemaerker',
    starwars: 'starwars-navnemaerker',
    spiderman: 'spiderman-navnemaerker',
    helloKitty: 'hello-kitty-navnemaerker'
  }),
  'www.namensetiketten.de': Object.assign({}, defaultConfig, {
    color: 'namensaufkleber',
    helloKitty: 'hello-kitty-namensaufkleber',
    classic: 'buegeletiketten'
  }),
  'www.ikioma.fi': Object.assign({}, defaultConfig, {
    color: 'nimitarrat',
    classic: 'silitettavat-nimilaput',
    disney: 'disney-nimitarrat',
    spiderman: 'spider-man-nimitarrat',
    helloKitty: 'hello-kitty-nimitarrat'
  })
}

const licence = {
  DF: ['anna', 'elsa', 'kristoff', 'olaf', 'sven', 'frozen'],
  DP: ['cinderella', 'ariel', 'aurora', 'belle', 'rapunzel', 'jasmin', 'snowwhite', 'tiana'],
  DMF: ['mikke', 'minnie', 'donald', 'dolly', 'langbein', 'pluto'],
  DC: ['mcqueen', 'bill', 'finn', 'francesco', 'holley', 'luigi', 'guido'],
  DWTP: ['pooh', 'tigger', 'piglet', 'eeyore'],
  DPL: ['dusty', 'chupa', 'skipper', 'echo', 'ripslinger'],
  DMU: ['sulley', 'mike', 'ok', 'ror', 'jox', 'eek', 'hss', 'pnk'],
  MS: ['spiderman', 'spidergirl', 'webwarriors'],
  HK: ['classic', 'pink', 'sporty', 'winter'],
  SW: ['luke', 'leia', 'yoda', 'han_solo', 'c3po_r2d2', 'dark_side', 'mix'],
  SWX: ['ezra', 'kanan', 'sabine', 'troopers', 'swr']
}

const licenceTypes = [{
  type: 'disney',
  keys: ['DF', 'DP', 'DMF', 'DC', 'DWTP', 'DPL', 'DMU']
}, {
  type: 'starwars',
  keys: ['SW', 'SWX']
}, {
  type: 'spiderman',
  keys: ['MS']
}, {
  type: 'helloKitty',
  keys: ['HK']
}]

export default class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      value: storage.getItem(STORAGE_KEY) || ''
    }
  }

  validData (value) {
    return true
  }

  changeField (value) {
    if (this.validData(value)) {
      this.setState({
        value: value
      }, () => storage.setItem(STORAGE_KEY, value))
    }
  }

  parseUrl (url) {
    const parsed = UrlParse(url)
    const query = queryParse(parsed.query)
    const [themeID, charID] = (query.icon && query.icon.indexOf('-') !== -1) ? query.icon.split('-') : [null, null]
    return Object.assign({}, parsed, {query, themeID, charID: parseInt(charID, 10)})
  }

  getType (obj) {
    if (obj.pathname.indexOf('labelpreview') !== -1) {
      if (obj.query.bg !== '-1') {
        return 'color'
      }
      return 'classic'
    }
    if (obj.pathname.indexOf('lpreview') !== -1) {
      return 'classic'
    }
    const found = licenceTypes.find(({keys}) => keys.find((key) => key === obj.themeID))
    return (found && found.type) ? found.type : false
  }

  orderParamsForType (type, obj) {
    switch (type) {
      case 'classic':
        return {
          cmd: 'edit_nametags',
          selected_icon_classic: obj.query.icon,
          motiv: true
        }
      case 'color':
        return {
          cmd: 'edit_nametags',
          selected_icon: obj.query.icon,
          bgColor: obj.query.bg,
          fgColor: obj.query.fg,
          font: obj.query.font,
          motiv: true
        }
      case 'disney':
      case 'starwars':
      case 'spiderman':
      case 'helloKitty':
        return {
          themeGroupId: obj.themeID,
          themeId: licence[obj.themeID][obj.charID - 1]
        }
      default:
        return {}
    }
  }

  linkForImageUrl (imageUrl) {
    const parsedData = this.parseUrl(imageUrl)
    const type = this.getType(parsedData)
    const selectedConfig = config[parsedData.hostname]
    return `${parsedData.protocol}//${parsedData.hostname}/${selectedConfig[type]}?order_params=${encodeURIComponent(queryStringify(this.orderParamsForType(type, parsedData))).replace(/'/g, '%27').replace(/"/g, '%22')}`
  }

  render () {
    const {value} = this.state
    const data = value.length > 0 ? value.split(/\r?\n/).map((item, i) => {
      return {
        imageLink: item,
        url: this.linkForImageUrl(item)
      }
    }) : null
    return (
      <div>
        <h1>Navnelapper url generator</h1>
        <p>Legg inn url til bilder, en på hver linje</p>
        {data && data.length > 0 && (
          <div>
            <button onClick={() => copy(data.map((item) => item.url).join('\r\n'))}>Kopier til skrivebord</button>
            <table>
              <tbody>
                {data.map((item, i) => {
                  return (
                    <tr key={i}>
                      <td><img src={item.imageLink} /></td>
                      <td><a href={item.url} target='_blank'>{item.url}</a></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Input type='text' multiline label='Bildeurler' value={value} onChange={(val) => this.changeField(val)} />
      </div>
    )
  }

}
