// @flow
import jwt from 'jsonwebtoken'
import createDebug from 'debug'
import dotenv from 'dotenv'

const debugAuth = createDebug('example:auth')

dotenv.config()

export async function errorHandler(ctx: Object, next: () => {}) {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.app.emit('error', err, ctx)
    ctx.type = 'application/json'
    ctx.body = { error: { message: err.message, status: ctx.status } }
  }
}

export function generateTokens(username: string, ctx: Object): Object {
  const accessExp = ctx.request.get('X-ACCESS-TOKEN-EXPIRES-IN')
  const refreshExp = ctx.request.get('X-REFRESH-TOKEN-EXPIRES-IN')
  debugAuth('accessExp: %s', accessExp)
  debugAuth('refreshExp: %s', refreshExp)
  const accessToken = jwt.sign(
    { user: { username, admin: process.env.USER_ADMIN === 'true' }, type: 'access' },
    process.env.SESSION_SECRET,
    { expiresIn: accessExp || '2h' }
  )
  const refreshToken = jwt.sign(
    { user: { username, admin: process.env.USER_ADMIN === 'true' }, type: 'refresh' },
    process.env.SESSION_SECRET,
    { expiresIn: refreshExp || '60d' }
  )
  return { accessToken, refreshToken }
}