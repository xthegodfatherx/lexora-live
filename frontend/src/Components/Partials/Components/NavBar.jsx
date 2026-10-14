import React, { useState, useContext, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../Styles/NavBar.css'
import { ReactComponent as ProfileIcon } from '../../../Assets/Icons/Account.svg';
import { ReactComponent as SettingsIcons } from '../../../Assets/Icons/setting-2.svg';
import { ReactComponent as NotificationsIcon } from '../../../Assets/Icons/Notifications.svg';
import { ReactComponent as LogoutIcon } from '../../../Assets/Icons/logout.svg';
import { ReactComponent as ArrowIcon } from '../../../Assets/Icons/Arrow.svg';
import { ReactComponent as ListIcon } from '../../../Assets/Icons/Union.svg';
import { ReactComponent as LightIcon } from '../../../Assets/Icons/appearance.svg';
import { ReactComponent as HelpIcon } from '../../../Assets/Icons/help.svg';
import { ReactComponent as InfoIcon } from '../../../Assets/Icons/info.svg';
import { ReactComponent as LockIcon } from '../../../Assets/Icons/lock-open.svg';
import { ReactComponent as TranslateIcon } from '../../../Assets/Icons/Translate.svg';
import { ReactComponent as LogoIcon } from '../../../Assets/Icons/logo-white.svg';
import './i18n'
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../../App';
import franceFlag from '../../../Assets/Images/la-france.png';
import ukFlag from '../../../Assets/Images/royaume-uni.png';
import saudiFlag from '../../../Assets/Images/saudi-arabia.png'
import axiosInstance from '../../../axios';


function NavBar({ menuItems, racinePath }) {

    const { isRtl } = useContext(AppContext);

    const [isParamMenuOpen, setIsParamMenuOpen] = useState(false);

    const closeParamMenu = () => setIsParamMenuOpen(false);

    const [currentIndex, setCurrentIndex] = useState(0);

    const [subCurrentIndex, setSubCurrentIndex] = useState(null);

    //------------Language i18n------------

    const { t } = useTranslation();

    //-------------settings menu-------------

    const [settingsClicked, setSettingsClicked] = useState(false);
    const [languesClicked, setLanguesClicked] = useState(false);

    const settingsMenuRef = useRef('');
    const languesMenuRef = useRef('')

    useEffect(() => {

        const handleSwitchAppearence = (e) => {
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
                setSettingsClicked(false);
            }
        }

        document.addEventListener('mousedown', handleSwitchAppearence);
        return () => {
            document.removeEventListener('mousedown', handleSwitchAppearence)
        } // when a change appear the switchModeRef (the container itself) it remove this eventListener

    }, [])

    useEffect(() => {

        const handleSwitchAppearence = (e) => {
            if (languesMenuRef.current && !languesMenuRef.current.contains(e.target)) {
                setLanguesClicked(false);
            }
        }

        document.addEventListener('mousedown', handleSwitchAppearence);
        return () => {
            document.removeEventListener('mousedown', handleSwitchAppearence)
        }

    }, [])

    const returnToSettings = () => {
        setLanguesClicked(false);
        setSettingsClicked(true);
    }

    const goToLangues = () => {
        setLanguesClicked(true);
        setSettingsClicked(false);
    }
    const handleLogout = async () => {
    try {
        const refresh = localStorage.getItem('refresh_token');

        if (!refresh) {
            alert("Aucun refresh token trouvé.");
            return;
        }

        await axiosInstance.post('logout/', {
            refresh: refresh
        });

       
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

       
        window.location.href = '/login';

    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        alert("Erreur de déconnexion. Veuillez réessayer.");
    }
};

    return (
        <div className='navbar-container'>
            <div className="nevbar-wrapper">
                <div className="logo-box" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <LogoIcon style= {{width: "60px", height: "60px"}} />
                </div>
                <div className="lists-container">
                    <ul>
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                {item.subMenu ? (
                                    <div
                                        className={`prameteres-item ${isParamMenuOpen ? "open" : ""}`}
                                    >
                                        <Link
                                            className={`list-item ${currentIndex === index ? "active" : ""}`}
                                            style={{ marginBottom: "0px" }}
                                            onClick={() => { setIsParamMenuOpen(!isParamMenuOpen); setCurrentIndex(index) }}
                                        >
                                            {item.icon}
                                            {item.name}
                                            <ArrowIcon className={`arrow-icon ${isParamMenuOpen ? "rotate" : ""} ${isRtl ? "arrow-icon-rtl" : ""} `} />
                                        </Link>
                                        <div className="sub-parametres-menu" style={{ right: isRtl ? "14px" : undefined }}>
                                            <ListIcon className={`list-icon ${isRtl ? "list-icon-rtl" : ""}`} />
                                            <ul className="sub-menu">
                                                {item.subMenu.map((subItem, subIndex) => (
                                                    <Link
                                                        className={`sub-list-item ${subCurrentIndex === subIndex ? "active" : ""}`}
                                                        onClick={() => setSubCurrentIndex(subIndex)}
                                                        key={subIndex}
                                                        to={subItem.path}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        className={`list-item ${currentIndex === index ? "active" : ""}`}
                                        onClick={() => { setCurrentIndex(index); closeParamMenu() }}
                                        to={item.path}>
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <ul>
                        <li>
                            <Link
                                className={`list-item ${currentIndex === "profile" ? "active" : ""}`}
                                onClick={() => { setCurrentIndex("profile"); closeParamMenu() }}
                                to={`${racinePath}/profile`}>
                                <ProfileIcon />
                                {t('navElements.profile')}
                            </Link>
                        </li>
                        <li style={{ position: "relative" }}>
                            <span
                                className={`list-item ${currentIndex === "settings" ? "active" : ""}`}
                                onClick={() => { setCurrentIndex("settings"); closeParamMenu(); setSettingsClicked(true) }}
                            >
                                <SettingsIcons />
                                {t('navElements.settings')}
                            </span>
                            {
                                settingsClicked &&
                                <SettingsMenu containerRef={settingsMenuRef} handleClick={goToLangues} />
                            }
                            {
                                languesClicked &&
                                <LanguageMenu containerRef={languesMenuRef} handleClick={returnToSettings} />
                            }
                        </li>
                        <li>
                            <Link
                                className={`list-item ${currentIndex === "notification" ? "active" : ""}`}
                                onClick={() => { setCurrentIndex("notification"); closeParamMenu() }}
                                to={`${racinePath}/notifications`}>
                                <NotificationsIcon />
                                {t('navElements.notifications')}
                            </Link>
                        </li>
                    </ul>
                    <ul className='logout-ul'>

                        <li className='list-item' onClick={handleLogout}>
                            <LogoutIcon />
                            {t('navElements.logout')}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

const SettingsMenu = ({ containerRef, handleClick }) => {

    const { t } = useTranslation();

    return (
        <ul
            className='settings-ul'
            style={{ borderBottom: "none" }}
            ref={containerRef}
        >
            <li onClick={() => handleClick()}>
                <span
                    className={`sub-settings-list-item`}
                >
                    <TranslateIcon />
                    {t('settingsList.langues')}
                </span>
            </li>
            <li>
                <span
                    className={`sub-settings-list-item`}
                >
                    <LightIcon />
                    {t('settingsList.appearance')}
                </span>
            </li>
            <li>
                <span
                    className={`sub-settings-list-item`}
                >
                    <NotificationsIcon />
                    {t('navElements.notifications')}
                </span>
            </li>
            <li>
                <span
                    className={`sub-settings-list-item`}
                >
                    <LockIcon />
                    {t('settingsList.trust')}
                </span>
            </li>
            <li>
                <span
                    className={`sub-settings-list-item`}
                >
                    <HelpIcon />
                    {t('settingsList.help')}
                </span>
            </li>
            <div
                className="line"
                style={{
                    width: "100%",
                    height: "1.5px",
                    backgroundColor: "#fff"
                }}
            />
            <li>
                <span
                    className={`sub-settings-list-item`}
                >
                    <InfoIcon />
                    {t('settingsList.infos')}
                </span>
            </li>
            <div
                className="line"
                style={{
                    width: "100%",
                    height: "1.5px",
                    backgroundColor: "#fff"
                }}
            />
        </ul>
    )
}

const LanguageMenu = ({ containerRef, handleClick }) => {

    const { setLang, setIsRtl, isRtl } = useContext(AppContext)

    const { t, i18n } = useTranslation();

    const changeLanguage = (lang, dir) => {
        i18n.changeLanguage(lang);
        setLang(lang);
        setIsRtl(dir)
    }

    return (
        <ul className='langues-ul' ref={containerRef}>
            <div className="title-langues">
                <div className="left-line">
                    <ArrowIcon className={`arrow-langues-icon ${isRtl ? "rtl-icon" : ""}`} onClick={() => handleClick()} />
                    {t('settingsList.langues')}
                </div>
                <TranslateIcon className="langue-icon" />
            </div>

            <li onClick={() => changeLanguage('fr', false)}>
                <span className={`sub-langues-list-item`}>
                    <img src={franceFlag} alt='france' />
                    {t('settingsList.french')}
                </span>
            </li>
            <li onClick={() => changeLanguage('en', false)}>
                <span className={`sub-langues-list-item`}>
                    <img src={ukFlag} alt='united kingdom' />
                    {t('settingsList.english')}
                </span>
            </li>
            <li onClick={() => changeLanguage('ar', true)}>
                <span className={`sub-langues-list-item`}>
                    <img src={saudiFlag} alt='saudi-arabia' />
                    {t('settingsList.arabic')}
                </span>
            </li>
        </ul>
    )
}

export default NavBar
