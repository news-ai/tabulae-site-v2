import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import Link from 'react-router/lib/Link';
import styled from 'styled-components';
import {grey50, grey700, blue500} from 'material-ui/styles/colors';
import isJSON from 'validator/lib/isJSON';
import Workspace from './Workspace';
import InfiniteScroll from 'components/InfiniteScroll';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};

const ListItem = styled.div.attrs({
  className: props => props.className
})`
  margin-bottom: 10px;
  border-radius: 1.5em;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 5px;
  padding-bottom: 5px;
  &:hover {
    background: ${grey50};
  }
`;

const TemplateManager = props => {
  const {templates, toggleArchiveTemplate} = props;
  return (
    <InfiniteScroll className='row horizontal-center' onScrollBottom={props.fetchTemplates}>
      <div className='large-10 medium-10 small-12 columns'>
        <div className='row' style={{marginTop: 20}} >
          <div className='large-9 medium-9 small-6 columns'>
            <span style={{fontSize: '2em'}} >Template Manager</span>
          </div>
          <div className='large-3 medium-3 small-6 columns'>
            <Link to='/workspace/new-template' >
              <RaisedButton
              label='New Template'
              backgroundColor={blue500}
              labelColor='#ffffff'
              labelStyle={{textTransform: 'none'}}
              icon={<FontIcon color='#ffffff' className='fa fa-edit' />}
              />
            </Link>
          </div>
        </div>
        <div style={{marginBottom: 50, marginTop: 50}}>
        {templates.map((template, i) => (
          <ListItem className='row vertical-center'>
            <div className='large-10 medium-10 small-9 columns'>
              <Link to={`/workspace/${template.id}`} style={{textTransform: 'none'}} >
              {template.name.length > 0 ? template.name : template.subject}
              </Link>
            </div>
            <div className='large-2 medium-2 small-3 columns'>
              <IconButton
              iconClassName='fa fa-trash'
              iconStyle={styles.smallIcon}
              style={styles.small}
              tooltip='Trash'
              tooltipPosition='top-center'
              onClick={_ => {
                alertify.confirm(
                  'Are you sure?',
                  `Trashed templates are irreversible. Are you sure you want to delete template: ${template.name.length > 0 ? template.name : template.subject}?`,
                  _ => toggleArchiveTemplate(template.id),
                  _ => {}
                  );
              }}
              />
            </div> 
          </ListItem>
          ))}
        </div>
      </div>
    </InfiniteScroll>
    );
};

class TemplateManagerContainer extends Component {
  componentWillMount() {
    this.props.fetchTemplates();
    mixpanel.track('access_template_manager');
  }

  render() {
    if (this.props.location.pathname === '/workspace/new-template' || this.props.params.templateId) return <Workspace {...this.props} />
    return <TemplateManager {...this.props} />;
  }
}

export default connect(
  state => ({
    templates: state.templateReducer.received
    .map(id => state.templateReducer[id])
    .filter(template => !template.archived)
    .reduce((saved, template) => {
      if (isJSON(template.body) && JSON.parse(template.body).date) {
      } else {
        saved = [...saved, template];
      }
      return saved;
    }, []),
  }),
  dispatch => ({
    fetchTemplates: _ => dispatch(templateActions.getTemplates()),
    saveCurrentTemplate: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(templateActions.toggleArchiveTemplate(templateId)),
  })
  )(TemplateManagerContainer);
