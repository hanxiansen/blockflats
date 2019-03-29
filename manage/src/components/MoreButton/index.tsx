import React, { Component } from 'react';
import './style.css';
import { LOGO_IMAGE } from '../../shared/constants';

interface IProps {
  reload: boolean;
  noData: boolean;
  onAgainChanged: () => void;
}

export default class MoreButton extends Component<IProps> {
  constructor(props: IProps){
    super(props);
  }

  public renderMoreButtonListBlockLoad(){
    return (
      <header className="more-button-list-block-header">
        <img src={LOGO_IMAGE} className="more-button-list-block-logo" alt="logo" />
      </header>
    );
  }

  public render(){
    const { reload, noData } = this.props;
    return (
      <div className="more-button" onClick={this.props.onAgainChanged}>
        <div className="more-button-reload">
          { reload ? this.renderMoreButtonListBlockLoad() : null}
        </div>
        <div className="more-button-text">
          { noData ? '没有更多数据': '更多' }
        </div>
      </div>
    )
  }
}
