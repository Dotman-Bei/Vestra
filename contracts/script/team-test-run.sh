#!/usr/bin/env bash
# Labeled TEAM TEST run of the full Vestra lifecycle: 10 transactions from 5 team test wallets.
# Every string written on-chain says it is a team test, and docs/DEPLOYMENTS.md lists the wallets.
# This demonstrates the deployed product works; it is not user activity and must not be presented as such.
#
#   MODE=fork    RPC=http://127.0.0.1:8546   bash script/team-test-run.sh   # rehearsal on an anvil fork
#   MODE=mainnet RPC=https://rpc.botchain.ai bash script/team-test-run.sh   # real run (needs admin key in .env)
set -euo pipefail
cd "$(dirname "$0")/.."

REG=0x560Ec94e3c74F41F05352e535a75E2d16dFB7CdE
ADMIN=0x3dB2d88263EA4c86Bac7abBC5Edb77Fac77d41B5
: "${MODE:?fork or mainnet}" "${RPC:?rpc url}"
set -a; . ./test-wallets.env; set +a

GP=$(cast gas-price --rpc-url "$RPC")
send() { # $1 key-or-unlocked, rest: cast send args. Prints gas used.
  local who=$1; shift
  local auth=(--private-key "$who"); [ "$who" = "UNLOCKED" ] && auth=(--unlocked --from "$ADMIN")
  cast send "$REG" "$@" --rpc-url "$RPC" --legacy --gas-price "$GP" "${auth[@]}" --json \
    | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);if(r.status!=='0x1'){console.error('REVERTED',r.transactionHash);process.exit(1)}console.log(parseInt(r.gasUsed)+' '+r.transactionHash)})"
}
log() { printf '%-34s %s\n' "$1" "$2"; }

if [ "$MODE" = fork ]; then
  cast rpc anvil_impersonateAccount "$ADMIN" --rpc-url "$RPC" >/dev/null
  for a in $REGISTRAR_ADDRESS $SERVICE_ADDRESS $STEWARD_ADDRESS $RECIPIENT_ADDRESS $SERVICE2_ADDRESS; do
    cast rpc anvil_setBalance "$a" 0xDE0B6B3A7640000 --rpc-url "$RPC" >/dev/null
  done
  ADMIN_AUTH=UNLOCKED
else
  ADMIN_AUTH=$(grep '^PRIVATE_KEY=' .env | cut -d= -f2 | tr -d '\r')
  [ ${#ADMIN_AUTH} -eq 66 ] || { echo "Admin PRIVATE_KEY missing in contracts/.env"; exit 1; }
fi

REGISTRAR_ROLE=$(cast call "$REG" 'REGISTRAR_ROLE()(bytes32)' --rpc-url "$RPC")
SERVICE_ROLE=$(cast call "$REG" 'SERVICE_PROVIDER_ROLE()(bytes32)' --rpc-url "$RPC")
Z=0x0000000000000000000000000000000000000000000000000000000000000000
REC='addRecord(uint256,(uint8,string,bytes32,string,string,uint8,uint32))'

echo "== admin role grants (setup, not counted)"
log "grant registrar"       "$(send "$ADMIN_AUTH" 'grantRole(bytes32,address)' "$REGISTRAR_ROLE" "$REGISTRAR_ADDRESS")"
log "grant service"         "$(send "$ADMIN_AUTH" 'grantRole(bytes32,address)' "$SERVICE_ROLE" "$SERVICE_ADDRESS")"
log "grant service 2"       "$(send "$ADMIN_AUTH" 'grantRole(bytes32,address)' "$SERVICE_ROLE" "$SERVICE2_ADDRESS")"

ID=$(( $(cast call "$REG" 'assetCount()(uint256)' --rpc-url "$RPC" | awk '{print $1}') + 1 ))
echo "== team test run on asset VST-$(printf '%04d' $ID)"
log "1 registrar: register" "$(send "$REGISTRAR_KEY" 'registerAsset((string,string,string,string,string,string,bytes32,address,uint8,string,bytes32,bytes32[]))' \
  "(\"Vestra team test asset (not real equipment)\",\"Solar inverter\",\"Team test, string inverter\",\"\",\"\",\"TEAM-TEST-0001\",$Z,$STEWARD_ADDRESS,0,\"\",$Z,[])")"
log "2 registrar: installation" "$(send "$REGISTRAR_KEY" "$REC" $ID "(3,\"TEAM TEST: installation record\",$Z,\"\",\"\",0,0)")"
log "3 registrar: status Active" "$(send "$REGISTRAR_KEY" "$REC" $ID "(5,\"TEAM TEST: status set to Active\",$Z,\"\",\"\",1,0)")"
log "4 service: inspection"   "$(send "$SERVICE_KEY" "$REC" $ID "(0,\"TEAM TEST: inspection record\",$Z,\"\",\"Vestra team\",0,0)")"
log "5 service: maintenance"  "$(send "$SERVICE_KEY" "$REC" $ID "(1,\"TEAM TEST: maintenance record\",$Z,\"\",\"Vestra team\",0,0)")"
log "6 service: correction"   "$(send "$SERVICE_KEY" "$REC" $ID "(8,\"TEAM TEST: corrects record 4\",$Z,\"\",\"Vestra team\",0,4)")"
log "7 steward: incident"     "$(send "$STEWARD_KEY" "$REC" $ID "(4,\"TEAM TEST: incident record\",$Z,\"\",\"\",0,0)")"
EXP=$(( $(cast block latest --field timestamp --rpc-url "$RPC") + 7*86400 ))
log "8 steward: propose handover" "$(send "$STEWARD_KEY" 'proposeHandover(uint256,address,uint64,bytes32)' $ID "$RECIPIENT_ADDRESS" $EXP $Z)"
log "9 recipient: accept handover" "$(send "$RECIPIENT_KEY" 'acceptHandover(uint256)' $ID)"
log "10 service 2: inspection" "$(send "$SERVICE2_KEY" "$REC" $ID "(0,\"TEAM TEST: second inspection\",$Z,\"\",\"Vestra team\",0,0)")"

echo "== final state"
echo "recipient is steward now: $(cast call "$REG" "canSubmit(uint256,address,uint8)(bool)" $ID "$RECIPIENT_ADDRESS" 7 --rpc-url "$RPC")  former steward still steward: $(cast call "$REG" "canSubmit(uint256,address,uint8)(bool)" $ID "$STEWARD_ADDRESS" 7 --rpc-url "$RPC")"
echo "records on asset: $(cast call "$REG" "getAsset(uint256)((string,string,string,string,string,string,bytes32,address,address,uint8,uint64,uint64,string,bytes32,uint32))" $ID --rpc-url "$RPC" | grep -oE "[0-9]+)$" | tr -d ")")"
