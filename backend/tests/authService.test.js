// Suite de Pruebas Unitarias de Autenticación y Seguridad
// Generado por QAAgent según antigravity/agents/qa-agent.md y specs/04-backend-api-spec.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../src/services/authService.js';

test('QAAgent - Suite de Pruebas de Autenticación y Seguridad', async (t) => {

  await t.test('1. Debería autenticar correctamente al Administrador con credenciales sembradas', async () => {
    const result = await authService.login('admin@tingomaria.gob.pe', 'admin123');
    assert.ok(result.token);
    assert.equal(result.user.role, 'ADMIN');
    assert.equal(result.user.email, 'admin@tingomaria.gob.pe');
  });

  await t.test('2. Debería autenticar correctamente al Turista Demo', async () => {
    const result = await authService.login('turista@demo.com', 'turista123');
    assert.ok(result.token);
    assert.equal(result.user.role, 'TURISTA');
  });

  await t.test('3. Debería rechazar login con contraseña incorrecta', async () => {
    await assert.rejects(
      async () => {
        await authService.login('turista@demo.com', 'clave_falsa_123');
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /inválidas/i);
        return true;
      }
    );
  });

  await t.test('4. Debería registrar un nuevo turista y emitir un token JWT válido', async () => {
    const uniqueEmail = `turista_${Date.now()}@tingomaria.pe`;
    const regResult = await authService.register(uniqueEmail, 'passwordSeguro99', 'María de la Selva');
    assert.ok(regResult.token);
    assert.equal(regResult.user.email, uniqueEmail);
    assert.equal(regResult.user.role, 'TURISTA');
  });
});
