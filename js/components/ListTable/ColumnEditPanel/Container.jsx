import React, { Component } from 'react';
import update from 'immutability-helper';
import Card from './Card.jsx';
import { DropTarget } from 'react-dnd';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey500, green50, green100, lightBlue50} from 'material-ui/styles/colors';
import alertify from 'utils/alertify';

class Container extends Component {
	constructor(props) {
		super(props);		
		this.state = { cards: props.list };
		this.addNewCard = this.addNewCard.bind(this);
		this.pushCard = this.pushCard.bind(this);
		this.removeCard = this.removeCard.bind(this);
		this.moveCard = this.moveCard.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.list !== nextProps.list) {
			this.setState({cards: nextProps.list});
		}
	}

	pushCard(card) {
		const {updateList, containerType} = this.props;
		const newCard = Object.assign({}, card, {hidden: containerType === 'hiddenList'});
		const newState = update(this.state, {
			cards: {
				$push: [newCard]
			}
		});
		this.setState(newState, _ => updateList(newState.cards, containerType));
	}

	removeCard(index) {		
		const {updateList, containerType} = this.props;
		const newState = update(this.state, {
			cards: {
				$splice: [
					[index, 1]
				]
			}
		});
		this.setState(newState, _ => updateList(newState.cards, containerType));
	}

	moveCard(dragIndex, hoverIndex) {
		const {updateList, containerType} = this.props;
		const {cards} = this.state;		
		const dragCard = cards[dragIndex];
		const newState = update(this.state, {
			cards: {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragCard]
				]
			}
		});

		this.setState(newState, _ => updateList(newState.cards, containerType));
	}

	addNewCard() {
		alertify.promisifyPrompt('Add New Column', 'Name new custom column', '')
			.then(value => {
    		if (this.state.cards.some(fieldObj => fieldObj.name === value || fieldObj.value === value)) {
    			alertify.alert('Duplicate Warning', `${value} as column name is already taken.`);
    		} else {
					const card = {
			      name: value,
			      value: value.toLowerCase().split(' ').join('_'),
			      customfield: true,
			      hidden: this.props.containerType === 'hiddenList' ? true : false
					};
					this.pushCard(card);
    		}
			});
	}

	render() {
		const { cards } = this.state;
		const { className, title, canDrop, isOver, connectDropTarget } = this.props;
		const isActive = canDrop && isOver;

		const backgroundColor = isActive ? green100 : lightBlue50;

		return connectDropTarget(
			<div className={className} style={{...style, backgroundColor}}>
				<div style={{margin: '10px 0'}} className='vertical-center'>
					<span style={{fontSize: '1.1em'}} >{title}</span>
				</div>
				{cards.map((card, i) => {
					return (
						<Card 
						key={card.value}
						index={i}
						listId={this.props.id}
						card={card}														
						removeCard={this.removeCard}
						moveCard={this.moveCard}
						/>
					);
				})}
				<div style={cardStyle}>
					<div className='vertical-center'>
						<FontIcon className='fa fa-plus' color={grey500} />
						<span style={{margin: '0 10px'}} onClick={this.addNewCard}>Add Column</span>
					</div>
				</div>
			</div>
		);
  }
}

const style = {
	border: `1px solid ${grey400}`,
};

const cardStyle = {
	border: '1px dashed gray',
	padding: '0.5rem 1rem',
	margin: '.5rem',
	backgroundColor: green50,
	cursor: 'pointer',
};

const cardTarget = {
	hover(targetProps, monitor) {
		const sourceProps = monitor.getItem();
		// console.log(targetProps);

	},
	drop(props, monitor, component) {
		const { id } = props;
		const sourceObj = monitor.getItem();		
		if ( id !== sourceObj.listId ) component.pushCard(sourceObj.card);
		return {
			listId: id
		};
	}
}

export default DropTarget('CARD', cardTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop()
}))(Container);
