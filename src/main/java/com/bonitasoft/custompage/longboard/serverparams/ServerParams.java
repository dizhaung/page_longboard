package com.bonitasoft.custompage.longboard.serverparams;

import java.util.HashMap;
import java.util.logging.Logger;

import org.bonitasoft.console.common.server.preferences.properties.ConsoleProperties;
import org.bonitasoft.console.common.server.preferences.properties.PropertiesFactory;
import org.bonitasoft.engine.service.TenantServiceAccessor;
import org.bonitasoft.engine.service.impl.ServiceAccessorFactory;
import org.bonitasoft.engine.session.APISession;

public class ServerParams {

    public static HashMap<String, Object> getServerParamsInfo(APISession apiSession) {
        Logger logger = Logger.getLogger("org.bonitasoft");

        HashMap<String, Object> serverParams = new HashMap<String, Object>();
        TenantServiceAccessor tenantServiceAccessor;
        serverParams.put("errormessage", "");
        try {
            tenantServiceAccessor = ServiceAccessorFactory.getInstance().createTenantServiceAccessor(apiSession.getTenantId());

            ConsoleProperties consoleProperties = PropertiesFactory.getConsoleProperties(apiSession.getTenantId());
            for (Object key : consoleProperties.getProperties().entrySet()) {
                // serverParams.put("CustompageDebug", consoleProperties.getProperty(ConsoleProperties.CUSTOM_PAGE_DEBUG));
                serverParams.put(key.toString(), consoleProperties.getProperty(key.toString()));
            }
            tenantServiceAccessor = ServiceAccessorFactory.getInstance().createTenantServiceAccessor(apiSession.getTenantId());

            serverParams.put("PersistencehibernateEnableWordSearch", "not implemented");

            // the word enable is a propertie of an
            // AbstractDBPersistenceService.
            // How get an AbstractDBPersistenceService ? Using a
            // tenantServiceAccessor, we access interface. Implementation uses
            // service, but they get it at constructor and don't expose them.
            // AbstractDBPersistenceService tenantPersistenceService;
            // tenantPersistenceService.isWordSearchEnabled(AbstractSearchEntity.class);

        } catch (Exception e) {
            serverParams.put("errormessage", "Error (" + e.toString() + "]");
        }
        logger.info("ServerParam return " + serverParams.toString());

        return serverParams;
    }

    /**
     * @param status
     * @param apiSession
     * @return
     */
    public static String setCustomePageDebug(boolean status, APISession apiSession) {
        ConsoleProperties consoleProperties = PropertiesFactory.getConsoleProperties(apiSession.getTenantId());
        try {
            // consoleProperties.setProperty(ConsoleProperties.CUSTOM_PAGE_DEBUG, status ? "true" : "false");

            return "statusChange";
        } catch (Exception e) {
            return "Error on change";
        }

    }

}
