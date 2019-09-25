import React from 'react'
import {Toast, navigation} from 'nr1'

import findRelatedAccountsWith from '../../src/lib/find-related-account-with'
import nrdbQuery from '../../src/lib/nrdb-query'

/**
 * render an ip address that on click will attempt to find the
 * host associated with it. Look at NetworkSample event data 
 * and search across all accounts.
 */
export default class IpAddress extends React.Component {
  constructor(props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }

  async onClick() {
    const ipAddress = this.props.value
    if(!ipAddress) return
  
    this.setState({searching: true})
    const where = `ipV4Address like '${ipAddress}/%'`
    const accounts = await findRelatedAccountsWith({eventType: "NetworkSample", where})
    if(accounts.length == 0) {
      Toast.showToast({
        title: "IP Address Not Found",
        description: `Could not find ${ipAddress} on any monitored hosts.`,
        type: Toast.TYPE.NORMAL
      })
    }
    else {
      const account = accounts[0]
      const nrql = `SELECT latest(entityGuid) as entityGuid FROM NetworkSample WHERE ${where} SINCE 2 minutes ago`
      const results = await nrdbQuery(account.id, nrql) 
      const {entityGuid} = results[0]
      navigation.openStackedEntity(entityGuid)
    }
    this.setState({searching: false})
  }

  render() {
    const {searching} = this.state || {}
    const className = searching ? "ip-address-searching" : "ip-address"
    return <div className={className} onClick={this.onClick}>
      {this.props.value || "(unknown)"}
    </div>
  }
}