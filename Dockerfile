FROM registry-harbor.misa.local/cegov/spa-ui:1.0.0.1
WORKDIR /app

COPY ./dist ./CeGovUI

RUN  rm -rf CeGovUI/cfg/

ENTRYPOINT ["/bin/sh", "-c", "cp -a /app/CeGovUI/. /app/cdn/cegov && dotnet MISA.EOffice.SPABackEnd.dll"]