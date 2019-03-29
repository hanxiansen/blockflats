import React, { Component } from 'react';
import './style.css';

interface IProps {
  text: string;
  open: boolean;
}

export default class Modal extends Component<IProps> {
  constructor(props: IProps){
    super(props);
  }

  public render(){
    const { text, open } = this.props;
    return (
      <div>
        { open ? (
            <div className="modal-extends">
            <div className="modal-extends-content">
              { text }
            </div>
          </div>
          ) : null
        }
      </div>
    );
  }
}
