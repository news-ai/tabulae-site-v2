import React from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

const styles = {
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100vh',
	},
	defaultBtnContainer: {
		borderBottom: '1px solid lightgray',
		padding: '0 20px 10px 20px',
		marginBottom: 10
	},
	button: {
		style: {
			margin: '0.2em'
		}
	},
	googButton: {
		labelStyle: {textTransform: 'none', color: '#ffffff'}
	}
};

const Login = ({loginWithGoogleClick, loginClick, registerClick}) => {
	return (
		<div style={styles.container}>
			<div>
		{/*
				<div style={{marginBottom: 50}} >
					<img src='https://storage.googleapis.com/tabulae-email-images/5689413791121408-IONAfFwuOEc0MJaeNbEGAk2oYYZl1YydCEgkoomRozY=-CopyofCopyofFINAL.png' />
				</div>
		*/}
				<div style={styles.defaultBtnContainer} className='vertical-center horizontal-center'>
					<div>
						<RaisedButton style={styles.button.style} label='Register' onClick={registerClick} />
						<RaisedButton style={styles.button.style} label='Login' onClick={loginClick} />
					</div>
				</div>
				<div className='vertical-center horizontal-center'>
					<RaisedButton
					backgroundColor='#4885ed'
					icon={<FontIcon color='#ffffff' className='fa fa-google' />}
					labelStyle={styles.googButton.labelStyle}
					label='Sign-in with Google'
					onClick={loginWithGoogleClick}
					/>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = state => {
	return {
		person: state.personReducer.person
	};
};

const mapDispatchToProps = dispatch => {
	return {
		loginWithGoogleClick: _ => dispatch(actions.loginWithGoogle()),
		registerClick: _ => dispatch(actions.register()),
		loginClick: _ => dispatch(actions.onLogin())
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
