import React, { Component } from 'react';
import './style.css';
import remindIcon from '../../assets/remind.png';

interface IProps {
  text: string;
}

export default class OneNoData extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render(){
    const { text } = this.props;
    return (
      <div className="one-no-data-container">
        <div className="one-no-data-icon">
          <img src={remindIcon} />
        </div>
        {text}
      </div>
    )
  }
}
