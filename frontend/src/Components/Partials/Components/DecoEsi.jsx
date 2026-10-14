import React, { useContext } from 'react'
import '../Styles/DecoEsi.css'
import logoESISBA from '../../../Assets/Images/logo_ESISBA.png'
import { AppContext } from '../../../App';
import { useTranslation } from 'react-i18next';

function DecoEsi() {

    const { lang } = useContext(AppContext)

    const { t } = useTranslation();

    const getFormattedDate = (lang) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date().toLocaleDateString(lang, options);
    };

    return (
        <div className='deco-container'>
            <div className="deco-wrapper">
                <div className="school-name-box">
                    <div className="date-line" style={{ fontWeight: "350", fontSize: "0.9rem" }}>
                        {getFormattedDate(lang)}
                    </div>
                    <div className="school-name-line">
                        <span style={{ fontSize: "1.5rem", fontWeight: "520" }}>
                            {t('schoolName')}
                        </span>
                        <span style={{ fontSize: "0.9rem" }}>
                            {t('school')}
                        </span>
                    </div>
                </div>
                <img src={logoESISBA} alt="logo de esi sba" style={{ minHeight: "100%" }} />
            </div>
        </div>
    )
}

export default DecoEsi
