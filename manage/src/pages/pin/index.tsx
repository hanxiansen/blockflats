import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from "react-router-dom";
import './style.css';
import { IStoreState } from '../../global/constants';
import * as actions from './flow/actions';
import { IPinStoreState } from './flow/constants';
import FullScreenLoad from '../../components/FullScreenLoad';
import RepoListItem from '../../components/RepoListItem';
import MoreButton from '../../components/MoreButton';
import Search from './component/search';
import { IStarInfo } from '../../services/constants';
import Modal from '../../components/Modal';
import OneNoData from '../../components/OneNoData';

interface IActionsProps{
  fetchPins: (page: number) => void;
  clean: () => void;
  pinAction: (index: number, star: IStarInfo) => void;
  searchPin: (searchKey: string) => void;
}

interface IProps extends RouteComponentProps<any>, IActionsProps {
  pin: IPinStoreState;
}

class PinPage extends Component<IProps> {

  public i: number;
  public once: boolean;

  constructor(props: IProps){
    super(props);
    this.i = 0;
    this.once = true;
  }

  componentDidMount(){
    this.againFetchStars();
  }

  componentWillUnmount(){
    this.props.clean();
  }

  public againFetchStars = () => {
    const { noData } = this.props.pin;
    if (!noData) {
      this.i = this.i + 1;
      this.props.fetchPins(this.i);
    }
  }

  public onPin = (star: IStarInfo, index: number) => {
    this.props.pinAction(index, star);
  }

  public renderPins(){
    const pin = this.props.pin;
    const { pinStars } = pin;
    return (
      <div className="pin-star-container">
        {
          pinStars.map((pinStar, i) => {
            return (
              <RepoListItem key={pinStar.id} star={ pinStar } index={i} onPinChanged={this.onPin} />
            )
          })
        }
      </div>
    )
  }

  public renderPinStarList(){
    const { pin } = this.props;
    const { reload, noData, oneNoData, onUpsearch } = pin;
    return (
      <div className="pin-stars-parent-container">
        {
          oneNoData ? <OneNoData text="没有更多 Pin 的数据"/> : (
            <div className="pin-stars-container">
              <Search
                onChanged={(value: string) => {
                  if (!value){
                    this.i = 1;
                    this.props.clean();
                    this.props.fetchPins(this.i);
                  } else {
                    this.props.searchPin(value);
                  }
                }}
              />
              {this.renderPins()}
              { onUpsearch ? (null) : <MoreButton
                reload={reload}
                noData={noData}
                onAgainChanged={this.againFetchStars} />
              }
            </div>
          )
        }
      </div>
    )
  }

  public render(){
    const { pin } = this.props;
    if (pin.pinStars.length > 0) {
      if (this.once) {
        this.once = false;
      }
    }
    const { openModal, openText, oneNoData } = pin;
    return (
      <div className="pin-container">
        {
          this.once ? oneNoData ? <FullScreenLoad/> : <OneNoData text="没有更多 Pin 的数据"/> : this.renderPinStarList()
        }
        <Modal
          open={openModal}
          text={openText}
        />
      </div>
    );
  }
}


const mapStateToProps = (state: IStoreState) => {
  const { pin } = state;
  return {
    pin
  }
}

export default connect(mapStateToProps, actions)(PinPage);
