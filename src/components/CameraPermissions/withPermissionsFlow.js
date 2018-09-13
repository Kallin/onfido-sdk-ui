// @flow
import * as React from 'react'
import { h, Component } from 'preact'
import PermissionsPrimer from '../CameraPermissions/Primer'
import PermissionsRecover from '../CameraPermissions/Recover'
import { checkIfWebcamPermissionGranted } from '../utils'

const permissionErrors = ['PermissionDeniedError', 'NotAllowedError', 'NotFoundError']

type State = {
  hasGrantedPermission: ?boolean,
  hasSeenPermissionsPrimer: boolean,
}

type InjectedProps = {
  hasGrantedPermission: boolean,
  onUserMedia: () => void,
  onFailure: Error => void,
}

export default <Props: *>(
    WrappedCamera: React.ComponentType<Props>
  ): React.ComponentType<Props & InjectedProps> =>
  class WithPermissionFlow extends Component<Props, State> {
    state: State = {
      hasGrantedPermission: undefined,
      hasSeenPermissionsPrimer: false,
    }

    componentDidMount() {
      checkIfWebcamPermissionGranted(value =>
        this.setState({ hasGrantedPermission: value || undefined }))
    }

    setPermissionsPrimerSeen = () => {
      this.setState({ hasSeenPermissionsPrimer: true })
    }

    handleUserMedia = () => {
      this.setState({ hasGrantedPermission: true })
      this.props.onUserMedia()
    }

    handleWebcamFailure = (error: Error) => {
      // $FlowFixMe
      if (Array.includes(permissionErrors, error.name)) {
        this.setState({ hasGrantedPermission: false })
      } else {
        this.props.onFailure()
      }
    }

    render() {
      const { hasSeenPermissionsPrimer, hasGrantedPermission } = this.state
      const { i18n, trackScreen } = this.props

      return (
        hasGrantedPermission === false ?
          <PermissionsRecover {...{i18n, trackScreen}} /> :
          (hasGrantedPermission || hasSeenPermissionsPrimer) ?
            <WrappedCamera
              {...this.props}
              hasGrantedPermission={hasGrantedPermission}
              onUserMedia={this.handleUserMedia}
              onFailure={this.handleWebcamFailure}
            />
            :
            <PermissionsPrimer {...{i18n, trackScreen}}
              onNext={this.setPermissionsPrimerSeen}
            />
      )
    }
  }
