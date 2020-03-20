import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {NavLink} from 'react-router-dom';
import {CopyToClipboard} from "react-copy-to-clipboard";

import QrButton from '../QrButton';

import {timeConverter, timezoneMatcher, titleConverter} from '../../lib';
import {detailWrapperConfig} from '../../config';

import './DetailWrapper.scss';

const MessageBox = (msgs, linkList, copyList, lang, key) => (
  <div className="message" key={key}>
    {
      msgs.map((msg, i) => (
        <div className="card" key={i}>
          <div className="type">
            {msg.type.split('/')[1]}
          </div>
          <div className="table">
            <div className="keys">
              {Object.keys(msg.value).map((key, i) => (
                <div key={i}>{key}</div>
              ))}
            </div>
            <div className="values">
              {
                Object.entries(msg.value).map(([key, value], i) => {
                  for (let i = 0; i < linkList.length; i += 1) {
                    console.log(linkList[i], key)
                    if (linkList[i].indexOf(key) !== -1) {
                      const linkTo = `/${lang}/${linkList[i].split('/')[0]}/${msg.value[key]}`;
                      return (<div key={key}>
                        {
                          key === 'url'
                            ? (<a href={msg.value[key]}>{msg.value[key]}</a>)
                            : (<NavLink to={linkTo}>{msg.value[key]}</NavLink>)
                        }
                        {
                          (copyList.indexOf(key) !== -1 && msg.value[key]) && CopyButton(msg.value[key])
                        }
                      </div>);
                    }
                  }

                  return (
                    <div key={i}>
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                      {
                        (copyList.indexOf(key) !== -1 && msg.value[key]) && CopyButton(msg.value[key])
                      }
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      ))
    }
  </div>
);

const MessageBoxMobile = (msgs, linkList, copyList, lang, key) => (
  <div className="message mobile" key={key}>
    {
      msgs.map((msg, i) => (
        <div className="card" key={i}>
          <div className="type">
            {msg.type.split('/')[1]}
          </div>
          <div className="table">
            <div className="row">
              <div className="title">
                {Object.keys(msg.value).map((key, i) => (
                <div key={i}>{key}</div>
              ))}
              </div>
              <div className="content">
                {
                  Object.entries(msg.value).map(([key, value], i) => {
                    for (let i = 0; i < linkList.length; i += 1) {
                      console.log(linkList[i], key)
                      if (linkList[i].indexOf(key) !== -1) {
                        const linkTo = `/${lang}/${linkList[i].split('/')[0]}/${msg.value[key]}`;
                        return (<div key={key}>
                          {
                            key === 'url'
                              ? (<a href={msg.value[key]}>{msg.value[key]}</a>)
                              : (<NavLink to={linkTo}>{msg.value[key]}</NavLink>)
                          }
                          {
                            (copyList.indexOf(key) !== -1 && msg.value[key]) && CopyButton(msg.value[key])
                          }
                        </div>);
                      }
                    }

                    return (
                      <div key={i}>
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                        {
                          (copyList.indexOf(key) !== -1 && msg.value[key]) && CopyButton(msg.value[key])
                        }
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div className="values">

            </div>
          </div>
        </div>
      ))
    }
  </div>
);

const CopyButton = (value) => {
  const [isCopied, setCopied] = useState(false);
  const onCopy = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false)
    }, 3000);
  };

  return (
    <CopyToClipboard text={value} onCopy={onCopy}>
      <div className={`copyButton${isCopied ? ' copied' : ''}`}></div>
    </CopyToClipboard>
  )
}

const DetailWrapperKey = ({titleList}) => (
  <div className="detailWrapperKey">
    {
      titleList.map(title => (
        <span key={title}>
          <FormattedMessage id={titleConverter(title)} />
        </span>
      ))
    }
  </div>
);

const ValueConverter = (title, value, linkList, copyList, lang, isMobile) => {
  let content = '';
  switch (title) {
    case 'Time Stamp':
      content = timeConverter(value) // timezoneMatcher(value);
      break;
    case 'Fee':
      if (value) {
        content = JSON.stringify(value).replace(/[{}"]/g, '').replace(/:/g, ': ').replace(/,/g, ', ')
      }
      break;
    case 'Message':
      console.log(title, value)
      if(!value)
        break;

      if(isMobile)
        content = MessageBox(value, linkList, copyList, lang, title);
      else
        content = MessageBoxMobile(value, linkList, copyList, lang, title);
        break;
    default:
      content = value
      break;
  }

  return content;
}

const DetailWrapperValue = ({titleList, linkList, copyList, data, lang}) => (
  <div className="detailWrapperValue">
    {
      titleList.map((title) => {
        if (title === 'Message' && data[title]) {
          return
        }

        for (let i = 0; i < linkList.length; i += 1) {
          if (linkList[i].indexOf(title) !== -1) {
            const linkTo = `/${lang}/${linkList[i].split('/')[0]}/${data[title]}`;
            return (
              <span key={title}>
                {
                  title === 'url'
                    ? (<a href={data[title]}>{data[title]}</a>)
                    : (<NavLink to={linkTo}>{data[title]}</NavLink>)
                }
                {
                  (copyList.indexOf(title) !== -1 && data[title]) && CopyButton(data[title])
                }
              </span>
            );
          }
        }

        let classNames = {
          memo: title === 'memo',
          success: title === 'Status' && data[title] === 'Success',
          failure: title === 'Status' && data[title] !== 'Success'
        }

        if (title === 'Status')
          classNames[data[title] === 'Success' ? 'success' : 'failure'] = true;

        let content = ValueConverter(title, data[title], linkList, copyList, data, lang);

        return (
          <span key={title} className={cx(classNames)}>
            {
              content
            }
            {
              (copyList.indexOf(title) !== -1 && data[title]) && CopyButton(data[title])
            }
          </span>
        );
      })
    }
  </div>
);

const DetailWrapper = ({
                         data, lang, mode, type,
                       }) => {
  const titleList = type ? detailWrapperConfig.titles[type] : [];
  const linkList = type ? detailWrapperConfig.linkTo[type] : [];
  const copyList = type ? detailWrapperConfig.copy[type] : [];

  return (
    mode === 0 ?
      (<div className={cx('detailWrapper')}>
        <DetailWrapperKey titleList={titleList} />
        <DetailWrapperValue titleList={titleList} linkList={linkList} copyList={copyList} data={data} lang={lang} />
      </div>) :
      (<div className={cx('detailWrapper', {mobile: true})}>
        {
          titleList.map(title => {
            console.log(title, data)
            let content = ValueConverter(title, data[title], linkList, copyList, data, lang, true);
            return (
              <div className="row">
                <div className="title">{title}</div>
                <div className="content">{content}</div>
              </div>
            )
          })
        }
      </div>)

  );
};

DetailWrapperKey.propTypes = {
  titleList: PropTypes.array.isRequired,
};

DetailWrapperValue.propTypes = {
  titleList: PropTypes.array.isRequired,
  linkList: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
};

DetailWrapper.propTypes = {
  data: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  mode: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
};

export default DetailWrapper;
